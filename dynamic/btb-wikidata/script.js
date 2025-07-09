/*

Example for getting images and name translations from WikiData.

Created for the Binoculars to Binomials course (https://www.jerthorp.me/learning)

*/

function setup() {
  //We'll stick the images to the main tag so I'll make a reference to that
  let main = select("main");
  //Now to request images + translations. 
  //Returns an array with objects like:
  //
  //{name:"Bird Name", url:"url to image"}
  //
  //Uses eBird codes for consistency - these codes are in the URLs for bird pages
  //Or you can get it from the API: https://api.ebird.org/v2/ref/taxonomy/ebird
  //
  //images are constrained in size in the CSS
  let birds = getWikiBirds(["amewoo", "amerob", "rocpig"], "fr");
  //The function returns a promise
  birds.then((wikiBirds) => {
    wikiBirds.forEach((wb) => {
      //Make a figure
      let fig = createElement("figure");
      main.child(fig);
      //Add the image
      let img = createImg(wb.url.value, wb.name);
      //And the caption
      let caption = createElement("figcaption");
      caption.html(wb.name);
      fig.child(img);
      fig.child(caption);
    });
  });
}

function draw() {}

/************** BEGIN WIKIDATA STUFF***********/

const endpointUrl = "https://query.wikidata.org/sparql";
let sparqlQuery = `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/> 
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX v: <http://www.wikidata.org/prop/statement/>

SELECT ?item ?itemLabel ?image ?ebird WHERE {
  VALUES ?BIRDS { {{birdlist}} }
  ?item wdt:P3444 ?BIRDS.
  
  OPTIONAL {?item wdt:P18 ?image.}
  OPTIONAL {?item wdt:P3444 ?ebird.}
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language {{lang}} .
   }
}`;

async function getWikiBirds(_birds, _lang) {
  //build space-delimited bird list
  let birdList = "";
  _birds.forEach((bird) => {
    birdList += '"' + bird + '" ';
  });
  console.log(birdList);

  let results = [];

  //Get common names(translated) and images from wikidata
  const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
  await queryDispatcher
    .query(
      sparqlQuery
        .replace("{{birdlist}}", birdList)
        .replace("{{lang}}", '"' + _lang + '"')
    )
    .then((wikis) => {
      console.log(wikis);
      let blist = wikis.results.bindings;
      blist.forEach((b) => {
        results.push({
          name: b.itemLabel.value,
          url: b.image,
        });
      });
    });

  return results;
}

class SPARQLQueryDispatcher {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  query(sparqlQuery) {
    console.log(sparqlQuery);
    const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
    const headers = {
      Accept: "application/sparql-results+json",
    };

    return fetch(fullUrl, { headers }).then((body) => body.json());
  }
}


