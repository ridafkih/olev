import xxhash from "@ridafkih/xxhash-wasm"
import { isUrlValid } from "./utils/url";
import { Lever } from "./platforms/lever";

const [, , url] = process.argv;

if (!isUrlValid(url)) {
  throw Error(`An invalid URL '${url}' was passed.`)  
}

const response = await fetch(url, { method: "GET" })
  .then((value) => value.text())
  
console.log(xxhash().h32ToString(response));

const lever = new Lever(url)
const listings = await lever.getListings();

console.log(listings);