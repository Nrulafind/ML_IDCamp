// ----Kolom deklarasi variabel-----
let input = document.querySelector('input');
let button = document.querySelector('button');
button.addEventListener('click', onClick);

let isModelLoaded = false;
let model;
let word2index;

// Parameter data preprocessing
const maxlen = 20;
const vocab_size = 2000;
const padding = 'post';
const truncating = 'post';

var myVar;
// -----------------------------------

function myFunction() {
    myVar = setTimeout(showPage, 3000);
}

function showPage() {
    document.getElementById("loaderlabel").style.display = "none";
    document.getElementById("loader").style.display = "none";
    document.getElementById("mainAPP").style.display = "block";
}

function detectWebGLContext() {
    // Create canvas element. The canvas is not added to the
    // document itself, so it is never displayed in the
    // browser window.
    var canvas = document.createElement("canvas");
    // Get WebGLRenderingContext from canvas element.
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    // Report the result.
    if (gl && gl instanceof WebGLRenderingContext) {
        console.log("Congratulations! Your browser supports WebGL.");
        init();
    } else {
        alert("Failed to get WebGL context. Your browser or device may not support WebGL.");
    }
}

detectWebGLContext();

// ----Kolom fungsi `getInput()`-----
// Fungsi untuk mengambil input review
function getInput() {
    const reviewText = document.getElementById('input')
    return reviewText.value;
}
// -----------------------------------

// ----Kolom fungsi `padSequence()`-----
// Fungsi untuk melakukan padding
function padSequence(sequences, maxLen, padding = 'post', truncating = "post", pad_value = 0) {
    return sequences.map(seq => {
        if (seq.length > maxLen) { //truncat
            if (truncating === 'pre') {
                seq.splice(0, seq.length - maxLen);
            } else {
                seq.splice(maxLen, seq.length - maxLen);
            }
        }

        if (seq.length < maxLen) {
            const pad = [];
            for (let i = 0; i < maxLen - seq.length; i++) {
                pad.push(pad_value);
            }
            if (padding === 'pre') {
                seq = pad.concat(seq);
            } else {
                seq = seq.concat(pad);
            }
        }
        return seq;
    });
}
// -----------------------------------


// ----Kolom fungsi `predict()`-----
// Fungsi untuk melakukan prediksi
function predict(inputText) {

    // Mengubah input review ke dalam bentuk token
    const sequence = inputText.map(word => {
        let indexed = word2index[word];

        if (indexed === undefined) {
            return 1; //change to oov value
        }
        return indexed;
    });

    // Melakukan padding
    const paddedSequence = padSequence([sequence], maxlen);

    const score = tf.tidy(() => {
        const input = tf.tensor2d(paddedSequence, [1, maxlen]);
        const result = model.predict(input);
        return result.dataSync()[0];
    });

    return score;

}
// -----------------------------------


// ----Kolom fungsi `onClick()`-----
// Fungsi yang dijalankan ketika tombol "Post Review" diclick
function onClick() {

    if (!isModelLoaded) {
        alert('Model not loaded yet');
        return;
    }

    if (getInput() === '') {
        alert("Review Can't be Null");
        document.getElementById('input').focus();
        return;
    }

    // 
    const inputText = getInput().trim().toLowerCase().split(" ");

    // Score prediksi dengan nilai 0 s/d 1 
    let score = predict(inputText);

    // Kondisi penentuan hasil prediksi berdasarkan nilai score
    if (score > 0.5) {
        alert('Positive Review \n' + score);
    } else {
        alert('Negative Review \n' + score);
    }
}
async function init() {

    // Memanggil model tfjs
    model = await tf.loadLayersModel('http://localhost:8080/Training/dicoding/ML_IDCamp/tfjs/tfjs_model/model.json');
    //await model.loadWeights('http://localhost:8080/Training/dicoding/ML_IDCamp/tfjs/tfjs_model/group1-shard1of1.bin');
    isModelLoaded = true;

    //Memanggil word_index
    const word_indexjson = await fetch('http://localhost:8080/Training/dicoding/ML_IDCamp/tfjs/word_index.json');
    word2index = await word_indexjson.json();

    console.log(model.summary());
    console.log('Model & Metadata Loaded Successfully');
}