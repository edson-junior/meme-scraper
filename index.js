import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio';

const url = "https://memegen-link-examples-upleveled.netlify.app/"
const images = []
const memesDir = './memes'

// check that the folder doesn't exist before creating it
if (!fs.existsSync(memesDir)) {
  fs.mkdirSync(memesDir);
}

async function scrape () {
  try {
    const response = await fetch(url)

    // we're not interested in proceeding if there's an error requesting the website
    if (response.status !== 200) {
      throw new Error('the website seems to not be available!')
    }

    const html = await response.text()
    const $ = cheerio.load(html);

    // create an array of the 10 first images
    $("#images > div").each((index, item) => {
      if (index === 10) {
        return false;
      }

      const src = $(item).find("img").attr('src')

      images.push(src)
    })

    // download all images in the `memes` folder
    images.forEach((image, index) => {
      downloadImage(image, index + 1)
    })
  } catch (error) {
    throw new Error(`we're having difficulties fetching those images ${error}`)
  }
}

async function downloadImage(image, index) {
  const response = await fetch(image);
  const data = await response.arrayBuffer()
  const imagePath = path.join(memesDir, index <= 9 ? `0${index}.jpg` : `${index}.jpg`)

  fs.writeFile(imagePath, Buffer.from(data), (err) => {
    if (err) {
      throw new Error(`we're having difficulties creating those images ${err}`)
    }

    console.log("Image created!");
  });
}

scrape()