const path = require("path");
const fs = require("fs");

const directoryPath = path.join(__dirname, "posts");

const postFiles = fs.readdirSync(directoryPath);

const hljs = require("highlight.js");

const md = require("markdown-it")({
    html: false,
    xhtmlOut: false,
    breaks: false,
    langPrefix: "language-",
    linkify: true,
    typographer: true,
    quotes: "“”‘’",
    highlight: function(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
        try {
            return (
            '<pre class="hljs"><code>' +
            hljs.highlight(lang, str, true).value +
            "</code></pre>"
            );
        } catch (__) {}
        }

        return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
        );
    }
})

const dir = "./deploy";
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const ejs = require("ejs");

const layoutHtmlFormat = fs.readFileSync(
    "./templates/layoutFormat.html",
    "utf8"
)

const articleHtmlFormat = fs.readFileSync(
    "./templates/articleFormat.html",
    "utf8"
)

//파일이름
getHtmlFileName = file => {
    return file.slice(0, file.indexOf(".")).toLowerCase()
}

const deployFiles = [];

//list_format.html 읽기
const listHtmlFormat  = fs.readFileSync("./templates/list_format.html", "utf8");


postFiles.map(file => {
    const body = fs.readFileSync(`./posts/${file}`,"utf-8");
    const converteBody = md.render(body);

    const articleContent = ejs.render(articleHtmlFormat, {
        body : converteBody
    });

    const articleHtml = ejs.render(layoutHtmlFormat, {
        content : articleContent
    });

    const fileName = getHtmlFileName(file);
    fs.writeFileSync(`./deploy/${fileName}.html`, articleHtml);
    deployFiles.push(fileName);
});

// index.html파일 생성/ 파일목록 렌더
const listContent = ejs.render(listHtmlFormat, {
    lists : deployFiles
});
const listHtml = ejs.render(layoutHtmlFormat, {
    content: listContent
})

fs.writeFileSync("./postList.html", listHtml);

