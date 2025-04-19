const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'key.json', // JSON 키 파일 이름
});

async function runOCR() {
  const [result] = await client.textDetection('20250419_141716.jpg'); // 이미지 파일명
  const detections = result.textAnnotations;

  if (detections.length === 0) {
    console.log('텍스트를 찾을 수 없습니다.');
  } else {
    console.log('감지된 텍스트:');
    console.log(detections[0].description);
  }
}

runOCR().catch(console.error);