const express = require('express');
const path = require('path');
const fs = require('fs');
const ndjson = require('ndjson');

const flatten = (arr, depth = 1) =>  {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
  }, []);
}

const app = express();

app.get('/', (req, res) => {
  const lyrics = [];
  fs.createReadStream(__dirname + '/songs.ndjson').
    pipe(ndjson.parse())
    .on('data', (lyric) => {
      lyric.sections = lyric.lyrics_text.split('[').filter(l => l).length;
      let artistsArr = lyric.lyrics_text
      .split('[')
      .filter(l => l)
      .map(l => l.split(']')[0])
      .map(l => l.split(':')[1] ? l.split(':')[1].trim() : lyric.primary_artist)
      .map(a => a.split(/[&,]/).filter(a => a).map(a => a.trim()));
      
      lyric.artists = flatten(artistsArr);
      lyrics.push(lyric);
    })
    .on('end', () => {
  
      lyrics.sort((a, b) => a.sections > b.sections ? -1 : 1);

      const artistsObj = {};
      lyrics.forEach(lyric => {
        lyric.artists.forEach(a => {
          artistsObj[a] = (artistsObj[a] || 0) + 1;
        });
      });

      let mostLyricSections = lyrics.slice(0, 5).map(l => `${l.primary_artist}: ${l.sections}`).join('\n'); 
      res.send(lyrics.map(l => l.artists)); 

      let mostSectionCounts = Object.keys(artistsObj).sort((a,b) => artistsObj[b] - artistsObj[a]).map(a => `${a}: ${artistsObj[a]}`).slice(0, 5).join('\n');

      fs.writeFile('output.txt', `Top 5 Artists with most Lyrics Sections: \n ${mostLyricSections} \n\n Top 5 Artist with section counts: \n ${mostSectionCounts}`)
  
  

      console.log('Top 5 Artists with most Lyrics Sections:\n', mostLyricSections);

      console.log('===============================================')

      console.log('Top 5 Artist with section counts:\n', mostSectionCounts);
    });
})

app.listen(3000, () => console.log('Listen on port 3000'))

//My thought process for the last question for most unique words. 

// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const ndjson = require('ndjson');
// const mongodb = require('mongodb').MongoClient;
// const app = express();
// const db = require('monk')('localhost:27017/songs')

// const flatten = (arr, depth = 1) =>  {
//   return arr.reduce((flat, toFlatten) => {
//     return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
//   }, []);
// }

// app.get('/', async (req, res) => {
//   const lyrics = [];
//   let artist_map = {};
//   let words_dict = {}; // collection or uniques words //  {id:0, name: "I"}
//   let word_count = 0;
//   let songs = 0;
//   let numArtist = 0
//   let allPr = []
//   //{'artist_name': set() of unique words}
//   fs.createReadStream(__dirname + '/song.ndjson').
//     pipe(ndjson.parse())
//     .on('data', async(lyric) => {
//       songs++;

//       lyric.sections = lyric.lyrics_text.split('[').filter(l => l).length;
//       //console.log('just lyric', lyric.lyrics_text)

//      // console.log('just lyric', lyric.lyrics_text.split('['))
//       //let justLyrics = lyric.lyrics_text
//       let artistsArr = lyric.lyrics_text
//       .split('[')
//       .filter(l => l)
//       .map(l => l.split(']')[0])
//       .map(l => l.split(':')[1] ? l.split(':')[1].trim() : lyric.primary_artist)
//       .map(a => a.replace(' and ', '+').split(/[&,+]/).filter(a => a).map(a => a.trim()));

//       // let justLyrics = lyric.
      
//       lyric.artists = flatten(artistsArr);
//       // process lyrics

//       //let words = lyric.lyrics_text.split('[').filter(l => l).map(l => l.split(']')[1])
//       let words = lyric.lyrics_text.replace(/[^[\]]+(?=])/g, "").replace(/\[|\]|,/g, "").trim().replace(/\n/g, " ")
  

//       //console.log(">>>>>",words,"<<<<<");
//       words = words.replace('.', '').split(' ').map(word => word.toLowerCase())
//       words = new Set(words);
//       //dbWords = db.get('words')
//       for(word of words){
//         // dbWords.find({'name': word}, {}, (err, allWords)=>{
//         //   if(allWords.length == 0){
//         //     dbWords.insert({'id': word_count, 'name': word}, (err, result)=>{
//         //       if(err) console.log(err);
//         //     })
         
//         //   }
//         // })
//         if (!Object.keys(words_dict).includes(word)){
//             words_dict[word] = word_count; // add to words collection
//             word_count++;
//         }
//       }

//       // artistsArr.forEach(artist =>{
//       //     artist_map[artist] = (artist_map[artist] || new Set())
//       // })


//       let p = Array.from(words).map( async( word ) => {
//            arr = artistsArr.map(async(artist) =>{
//             dbArtist = db.get('artists');
//             try{
//               let matches = await dbArtist.find({"name": artist});
//               console.log("<", matches);
//               if(matches.length == 1){
//                 art = matches[0];
//                 if (!art.unique_words.includes(word)){
//                   await dbArtist.update({"name": artist}, {$push: {"unique_words": word}, $set: {'count':art.count + 1}})
//                 }
              
//               }else{

//                 try {
//                   re = await dbArtist.insert({'name': artist, 'unique_words': [word], 'count': 1})
//                   numArtist++;
//                   console.log('number of artists', numArtist, re)
//                 } catch (error) {
//                     console.log(err)
//                 }
                
//               }
//               return numArtist

//             }catch(err){
//               console.log(err)
//             }
            

//            });

//            try {
//             let intermediate = await Promise.all(arr)
//             return intermediate;
//            } catch (error) {
//              console.log("intermediate",error)
//            }
//            return 0;
         

//       })
//       try {
//         let final =  await Promise.all(p)
//       } catch (error) {
//         console.log('final', error);
//       }
      
//       //for (let word of words){

//           // check/
        
//         //  dbArtist.find({"name": artist}).then((matches, err) =>{
//         //       if (err) console.log('mongo', err)
//         //       if(matches.length == 1){
//         //         art = matches[0];
//         //         if (!art.unique_words.includes(word)){
//         //           dbArtist.update({"name": artist}, {$push: {"unique_words": word}, $set: {'count':art.count + 1}}).then( (err, doc)=>{
//         //             if(err) console.log(err)
//         //           })
//         //         }
              
//         //       }else{
//         //         dbArtist.insert({'name': artist, 'unique_words': [word], 'count': 1}).then(match=>{
//         //           numArtist++;
//         //           console.log('number of artists', numArtist)
//         //         })
              
//         //       }
//         //   })



//           // artist_map[artist].add(words_dict[word])
      
//           //bject.values(artist_map).forEach(set => set.add(words_dict[word]))
//       //}


//       lyrics.push(lyric);
//       console.log('Top 5 Artists with unique words', songs, "Total number of unqiue words: ", Object.keys(words_dict).length, "Number or artists", numArtist)
//     })
//     .on('end', () => {
//       lyrics.sort((a, b) => a.sections > b.sections ? -1 : 1);

//       const artistsObj = {};
//       lyrics.forEach(lyric => {
//         lyric.artists.forEach(a => {
//           artistsObj[a] = (artistsObj[a] || 0) + 1;
//         });
//       });
//       res.send(lyrics.map(l => l.artists));

//       console.log('Top 5 Artists with most Lyrics Sections:\n', lyrics.slice(0, 5).map(l => `${l.primary_artist}: ${l.sections}`).join('\n'));

//       console.log('===============================================')

//       console.log('Top 5 Artist with section counts:\n', Object.keys(artistsObj).sort((a,b) => artistsObj[b] - artistsObj[a]).map(a => `${a}: ${artistsObj[a]}`).slice(0, 5).join('\n'));


//       console.log('===============================================')
//      // let tem =  Object.keys(artist_map).map( name => ({size: artist_map[name].size, 'name': name})).sort((a,b) => b.size - a.size).slice(0,5)
//       //console.log(tem)

//     });

    
// })

// app.listen(3000, () => console.log('server startedd'))
