import xxhash from "@ridafkih/xxhash-wasm"
import { isUrlValid } from "./utils/url";
import { Lever } from "./platforms/lever";

const [, , url] = process.argv;

if (!isUrlValid(url)) {
  throw Error(`An invalid URL '${url}' was passed.`)  
}

const hash = xxhash().create32()

const lever = new Lever(url)
const listings = await lever.getListings();

console.log(listings);
