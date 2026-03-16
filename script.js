
/* ================================
   CLIENT DATA
================================ */

const clients = {

    monkeybar: {
        tone: "fun witty nightlife",
        audience: "millennials, gen-z, foodies",
        examples: [
            "Good food = good mood",
            "Calories don't count on weekends",
            "Your cheat meal just arrived"
        ]
    },

    potions: {
        tone: "premium sensual luxurious",
        audience: "adults couples nightlife",
        examples: [
            "An experience worth savoring",
            "Where every sip tells a story",
            "Luxury in every moment"
        ]
    },

    burgerhub: {
        tone: "playful foodie casual",
        audience: "food lovers, young crowd",
        examples: [
            "Life is better with extra cheese",
            "Weekend calories don't count",
            "Burgers first. Diet later"
        ]
    }

};


/* ================================
   IMAGE PREVIEW
================================ */

document.getElementById("imageUpload").onchange = function (e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        const preview = document.getElementById("preview");

        preview.src = reader.result;

        preview.style.display = "block";

    }

    reader.readAsDataURL(file);

};


/* ================================
   CONVERT IMAGE TO BASE64
================================ */

function convertImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {

            const base64 = reader.result.split(",")[1];

            resolve(base64);

        };

        reader.onerror = error => reject(error);

    });

}


/* ================================
   COPY TEXT FUNCTION
================================ */

function copyText(text) {

    navigator.clipboard.writeText(text);

    alert("Copied to clipboard");

}


/* ================================
   RENDER OUTPUT
================================ */

function renderOutput(text) {

    const output = document.getElementById("output");

    output.innerHTML = "";

    /* EXTRACT CAPTIONS */

    const captionRegex = /CAPTION_\d:\s*([\s\S]*?)(?=CAPTION_\d:|HASHTAGS:)/g;

    let captions = [];

    let match;

    while ((match = captionRegex.exec(text)) !== null) {

        captions.push(match[1].trim());

    }

    /* EXTRACT HASHTAGS */

    const hashtagMatch = text.match(/HASHTAGS:\s*(.*)/);

    let hashtags = [];

    if (hashtagMatch) {

        hashtags = hashtagMatch[1].split(" ");

    }


    /* CAPTION CARDS */

    captions.forEach(caption => {

        output.innerHTML += `
<div class="caption-card">

<p>${caption}</p>

<button class="copy-btn" onclick="copyText(\`${caption}\`)">
Copy Caption
</button>

</div>
`;

    });


    /* HASHTAG SECTION */

    output.innerHTML += `
<div class="hashtag-section">

<h5 class="hashtag-title">Hashtags</h5>

<div class="hashtag-list">

${hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join("")}

</div>

</div>
`;

}


/* ================================
   GENERATE CAPTION
================================ */

async function generateCaption() {

    const description =
        document.getElementById("description").value;

    const client =
        document.getElementById("client").value;

    const file =
        document.getElementById("imageUpload").files[0];

    if (!file) {

        alert("Please upload an image");

        return;

    }

    const clientData = clients[client];

    const base64Image = await convertImage(file);

    const examples = clientData.examples.join("\n");


    /* PROMPT */

    const prompt = `
You are a professional Instagram copywriter.

Brand Tone: ${clientData.tone}
Audience: ${clientData.audience}

Example captions:
${examples}

Creative description:
${description}

Analyze the uploaded image.

Generate:
1. Three Instagram captions
2. 20 hashtags

IMPORTANT RULES:
- Do NOT give explanations
- Do NOT describe your reasoning
- Only return captions and hashtags

Return EXACTLY like this:

CAPTION_1:
<caption>

CAPTION_2:
<caption>

CAPTION_3:
<caption>

HASHTAGS:
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10 #tag11 #tag12 #tag13 #tag14 #tag15 #tag16 #tag17 #tag18 #tag19 #tag20
`;


    /* LOADING STATE */

    document.getElementById("output").innerHTML =
        "<div class='text-center p-4'>Generating captions...</div>";

    try {

        const response = await fetch(
            "/.netlify/functions/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: "image/jpeg",
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

        const data = await response.json();

        console.log(data);


        /* CHECK RESPONSE */

        if (data.candidates && data.candidates.length > 0) {

            const result =
                data.candidates[0].content.parts[0].text;

            renderOutput(result);

        } else {

            document.getElementById("output").innerHTML =
                "<div class='text-danger'>No captions returned</div>";

        }

    } catch (error) {

        console.error(error);

        document.getElementById("output").innerHTML =
            "<div class='text-danger'>API request failed</div>";

    }

}

