const fs = require('fs');

export function writeBase64ToFile(fileName, base64String) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH);
  }

  fs.writeFile(FILE_PATH + fileName, buffer, (error) => {
    if (error) {
      console.error('Error writing file:', error);
    } else {
      console.log('File written successfully:', fileName);
    }
  });
}

export function readAndConvertToBase64(fileName) {
  return new Promise((resolve, reject) => {

    fs.readFile(FILE_PATH + fileName, (error, data) => {
      if (error) {
        resolve(undefined)
      } else {

        const base64String = Buffer.from(data).toString('base64');
        const base64Image = `data:image/${fileName};base64,${base64String}`;
        resolve(base64Image);
      }
    });
  })
}

// Example usage
const FILE_PATH = './files/'; // Specify the desired file path

