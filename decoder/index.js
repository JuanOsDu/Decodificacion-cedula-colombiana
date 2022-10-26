const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3000;

const { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = require('@zxing/library');
const fs = require('fs');
const jpeg = require('jpeg-js');

const jpegData = fs.readFileSync('daniel.jpg');
const rawImageData = jpeg.decode(jpegData);


const hints = new Map();
const formats = [BarcodeFormat.PDF_417, BarcodeFormat.DATA_MATRIX];
 
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
hints.set(DecodeHintType.TRY_HARDER, true);
 
const reader = new MultiFormatReader();
 
reader.setHints(hints);



const len = rawImageData.width * rawImageData.height;

const luminancesUint8Array = new Uint8Array(len);

for(let i = 0; i < len; i++){
	luminancesUint8Array[i] = ((rawImageData.data[i*4]+rawImageData.data[i*4+1]*2+rawImageData.data[i*4+2]) / 4) & 0xFF;
}

const luminanceSource = new RGBLuminanceSource(luminancesUint8Array, rawImageData.width, rawImageData.height);

console.log(luminanceSource)

const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));


const decoded = reader.decode(binaryBitmap);

console.log(decoded)
app.use(
    fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);

// Add this line to serve our index.html page
app.use(express.static('public'));



app.post('/upload', (req, res) => {
   
    const { image } = req.files;
   
    const codeReader = new ZXing.BrowserQRCodeReader();
    codeReader
        .decode('https://s3-us-west-1.amazonaws.com/solidfit-stage/default/images/upc-03800075603.png')
        .then(result => console.log(result.text))
        .catch(err => console.error(err));
    if (!image) return res.sendStatus(400);
    console.log(image.name)
 
  

    image.mv(__dirname + '/upload/' + image.name);


   
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});