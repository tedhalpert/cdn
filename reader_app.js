
const deployment = 1 // 0: Web; 1: iOS; 2: Android
let windowWidth = window.innerWidth
let fontSize = 1 // 0,1,2,3,4
let appearanceMode = 0 // 0: Light; 1: Dark
let mediaWidth = 0 // 0: Full-width; 1: Text-align-width
let fontFamily = 0
let renderLatex = 0

window.addEventListener("resize", function() {
    windowWidth = window.innerWidth
    updateDynamicStyle()
    let div = document.getElementById("merReader")
    div.style.maxWidth = containerInlineStyle().maxWidth
    div.style.border = containerInlineStyle().border
})

// window.addEventListener("load", function() {
//     console.log("It's loaded!")
// })

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded!")
    updateHTMLClass()
    updateStaticStyle()
    updateDynamicStyle()
})

var maxWidth = function() {
    return windowWidth >= 992 ? 850 : 992
}

var contentPadding = function() {
    return windowWidth >= 576 ? "30px 60px 100px" : "18px 15px 150px"
}

var contentStyle = function() {
    let spacing = windowWidth >= 576 ? "0.5px" : "normal"
    return {
        padding: contentPadding(),
        letterSpacing: spacing
    }
}

var containerBorder = function() {
    return windowWidth >= 992 ? "1px solid #ededed" : "none"
}

var containerInlineStyle = function() {
    return {
        maxWidth: maxWidth() + "px",
        border: containerBorder()
    }
}

var filePath = function() {
    var path = window.location.href
    return path.substring(0, path.length - 16)
}

var containerClass = function() {
    let appearance = appearanceMode == 0 ? "mer_light" : "mer_dark"
    let mediaFrame = mediaWidth == 0 ? "media_full_width" : "media_text_width"
    let typeface
    switch (fontFamily) {
        case 1:
            typeface = "athelas"
            break
        case 2:
            typeface = "charter"
            break
        case 3:
            typeface = "georgia"
            break
        case 4:
            typeface = "palatino"
            break
        case 5:
            typeface = "seravek"
            break
        case 6:
            typeface = "times_new_roman"
            break
        case 7:
            typeface = "source_han_sans"
            break
        case 8:
            typeface = "source_han_serif"
            break
        case 9:
            typeface = "apple_system_ui_serif"
            break
        default:
            typeface = null
    }
    if (typeface != null) {
        return [appearance, mediaFrame, typeface]
    } else {
        return [appearance, mediaFrame]
    }
}

var updateHTMLClass = function() {
    updateFontSize()
    let div = document.getElementById("merReader")
    DOMTokenList.prototype.add.apply(div.classList, containerClass())
    div.style.maxWidth = containerInlineStyle().maxWidth
    div.style.border = containerInlineStyle().border
}

var updateFontSize = function() {
    let html = document.documentElement || document.getElementsByTagName('html')[0]
    const size = parseInt(fontSize) // fontSize might be string value
    switch (size) {
        case 0:
            html.classList.remove('mer_medium', 'mer_large', 'mer_xlarge', 'mer_xxlarge')
            html.classList.add('mer_small')
            break
        case 1:
            html.classList.remove('mer_small', 'mer_large', 'mer_xlarge', 'mer_xxlarge')
            html.classList.add('mer_medium')
            break
        case 2:
            html.classList.remove('mer_small', 'mer_medium', 'mer_xlarge', 'mer_xxlarge')
            html.classList.add('mer_large')
            break
        case 3:
            html.classList.remove('mer_small', 'mer_medium', 'mer_large', 'mer_xxlarge')
            html.classList.add('mer_xlarge')
            break
        case 4:
            html.classList.remove('mer_small', 'mer_medium', 'mer_large', 'mer_xlarge')
            html.classList.add('mer_xxlarge')
            break
        default:
            html.classList.remove('mer_large', 'mer_xlarge', 'mer_xxlarge')
            html.classList.add('mer_medium')
            break
    }
}

var updateStaticStyle = function() {
    let style = document.getElementById('staticStyle')
    var scale = 1 / window.devicePixelRatio
    style.innerHTML = `
    hr {height: ${scale}px;}
    table, th, td {border: ${scale}px solid #979795;}
    `
}

var updateDynamicStyle = function() {
    if (mediaWidth == 0) {
        let style = document.getElementById('dynamicStyle')
        let container = document.getElementById('merReader')
        let rect = container.getBoundingClientRect()
        let width = windowWidth >= 992 ? maxWidth() : rect.width
        let margin = windowWidth >= 576 ? '.93em -60px' : '.93em -15px'
        style.innerHTML = `
        .media_full_width #articleContent img,
        .media_full_width #articleContent iframe:not([id^=twitter-widget]),
        .media_full_width #articleContent video {
            max-width: ${width}px;
            margin: ${margin};
        }
        `
    }
    let articleContent = document.getElementById("articleContent")
    articleContent.style.padding = contentStyle().padding
    articleContent.style.letterSpacing = contentStyle().letterSpacing
}

/*
 change post
*/
var changePost = function(newPost) {
    // scroll to top of page before changing post
    window.scrollTo(0, 0)

    let html = document.documentElement
    let base = document.getElementById('baseTag')
    let title = document.getElementById("titleEle")
    let author = document.getElementById("authorEle")
    let url = document.getElementById("urlEle")
    let timestamp = document.getElementById("timestampEle")
    let articleBody = document.getElementById("articleBodyEle")

    let post
    if (deployment == 0) {
        post = {
            url: newPost.url,
            baseUrl: newPost.baseUrl,
            title: newPost.title,
            pubDate: newPost.pubDate,
            author: newPost.author,
            publisher: newPost.publisher,
            lang: newPost.lang,
            content: decodeHTMLContent(newPost.content)
        }
    } else if (deployment == 1) {
        const decodedData = b64DecodeUnicode(newPost)
        const postObj = JSON.parse(decodedData)
        post = {
            url: postObj.articleUrl,
            baseUrl: postObj.baseUrl,
            title: postObj.title,
            pubDate: postObj.pubDate,
            author: postObj.author,
            publisher: postObj.feedTitle,
            lang: postObj.langCode,
            content: decodeHTMLContent(postObj.content)
        }
    }
    html.setAttribute('lang', post.lang)
    base.href = post.baseUrl + '/'
    articleBody.innerHTML = post.content
    author.textContent = post.author
    url.textContent = post.publisher
    url.href = post.url
    timestamp.textContent = post.pubDate
    title.textContent = post.title
    setTimeout(() => {
        console.log("change post setTimeout()")
        hanRender()
        handleImages()
        updateLinkUTMSource()
        loadTwitterWidget()
    }, 0)
}

var hanRender = function() {
    if (Han != null) {
        const lang = document.getElementsByTagName('html')[0].getAttribute("lang")
        if (lang.startsWith('zh') || lang.startsWith('ja')) {
            Han(document.getElementById('merReader'))
                .initCond()
                .renderElem()
                //.renderHanging()
                .renderJiya()
                .renderHWS()
                .correctBasicBD()
                .substCombLigaWithPUA()
        }
    }
}

var decodeHTMLContent = function(content) {
    var textArea = document.createElement('textarea')
    textArea.innerHTML = content
    return textArea.value
}

var b64DecodeUnicode = function(objString) {
    return decodeURIComponent(atob(objString).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''))
}

/*
 change style of post
*/
var changeAppearance = function(val) {
    appearanceMode = parseInt(val) // val might be string value
    let div = document.getElementById("merReader")
    if (appearanceMode == 0) {
        div.classList.remove("mer_dark")
        div.classList.add("mer_light")
    } else {
        div.classList.remove("mer_light")
        div.classList.add("mer_dark")
    }
    switchTwitterWidgetAppearance()
}

var changeMediaWidth = function(val) {
    mediaWidth = parseInt(val) // val might be string value
    let div = document.getElementById("merReader")
    if (mediaWidth == 0) {
        div.classList.remove("media_text_width")
        div.classList.add("media_full_width")
    } else {
        div.classList.remove("media_full_width")
        div.classList.add("media_text_width")
    }
}

var changeFontSize = function(val) {
    fontSize = parseInt(val) // val might be string value
    updateFontSize()
}

var changeFontFamily = function(val) {
    if (fontFamily == val) {
        return
    }
    const currentVal = fontFamily
    fontFamily = parseInt(val) // val might be string value
    let div = document.getElementById("merReader")
    switch (currentVal) {
        case 1:
            div.classList.remove("athelas")
            break
        case 2:
            div.classList.remove("charter")
            break
        case 3:
            div.classList.remove("georgia")
            break
        case 4:
            div.classList.remove("palatino")
            break
        case 5:
            div.classList.remove("seravek")
            break
        case 6:
            div.classList.remove("times_new_roman")
            break
        case 7:
            div.classList.remove("source_han_sans")
            break
        case 8:
            div.classList.remove("source_han_serif")
            break
        case 9:
            div.classList.remove("apple_system_ui_serif")
            break
        default:
            break
    }
    switch (fontFamily) {
        case 1:
            div.classList.add("athelas")
            break
        case 2:
            div.classList.add("charter")
            break
        case 3:
            div.classList.add("georgia")
            break
        case 4:
            div.classList.add("palatino")
            break
        case 5:
            div.classList.add("seravek")
            break
        case 6:
            div.classList.add("times_new_roman")
            break
        case 7:
            div.classList.add("source_han_sans")
            break
        case 8:
            div.classList.add("source_han_serif")
            break
        case 9:
            div.classList.add("apple_system_ui_serif")
            break
        default:
            break
    }
}

/*
handle images
*/
var handleImages = function() {
    const imgs = document.querySelectorAll('img')
    for (let img of imgs) {
        img.onload = function() {
            handleSmallImage(this, this.naturalWidth)
        }
        img.onerror = function() {
            img.parentNode.removeChild(img)
        }
        let src = img.getAttribute("src")
        if (src == null) {
            const dataSrc = img.getAttribute("data-src")
            if (dataSrc != null) {
                img.setAttribute("src", dataSrc)
                tapOnImg(img)
            }
        }

        // add click function to images
        tapOnImg(img)
    }
}

var handleSmallImage = function(img, naturalWidth) {
    let container = document.getElementById('merReader')
    let rect = container.getBoundingClientRect()
    let contentWidth = this.windowsWidth >= 992 ? this.maxWidth : rect.width
    let contentDiv = document.getElementById('articleContent')
    if (contentDiv == null) {
        return
    }
    let padding = windowWidth >= 576 ? 60 : 15
    let expectedWidth = windowWidth == 0 ? contentWidth : (contentWidth - padding * 2)

    let imgWidth = naturalWidth
    if (imgWidth <= 72) {
        img.classList.add('icon_img')
    } else if (imgWidth < expectedWidth / 2) {
        img.classList.add('small_img')
        img.style.removeProperty('width')
    } else if (imgWidth >= expectedWidth) {
        img.classList.remove('small_img')
        img.style.removeProperty('width')
    } else {
        if (mediaWidth == 0) {
            if (imgWidth > (contentWidth - padding * 2)) {
                img.classList.remove('small_img')
                img.style = `
                        width: ${expectedWidth}px;
                        `
            } else {
                img.classList.add('small_img')
                img.style.removeProperty('width')
            }
        }
    }
}

var tapOnImg = function(img) {
    img.onclick = function(e) {
        var url = this.getAttribute('src')
        var imgRect = this.getBoundingClientRect()
        // 在iOS 10里，getBoundingClientRect()返回的结构体里，参数x和y是undefined， 对应的值在left和top参数，所以构建iOSRect时，判断如果x和y是undefined，则使用left和top参数
        var rectObj = {
            x: imgRect.x ? imgRect.x : imgRect.left,
            y: imgRect.y ? imgRect.y : imgRect.top,
            width: imgRect.width,
            height: imgRect.height
        }
        var imageInfo = {
            src: url,
            boundingRect: rectObj
        }
        if (deployment == 0) {
            console.log(imageInfo)
        } else if (deployment == 1) {
            // 将onclick监听事件和相关参数传给Swift调用
            window.webkit.messageHandlers.imageTapped.postMessage(imageInfo);
        }
    }
}

var getImageRectBy = function(urlString) {
    var predicate = "img[src='" + urlString + "']";
    var images = document.querySelectorAll(predicate);
    var img = images.item(0);
    var htmlRect = img.getBoundingClientRect();
    // 在iOS 10里，getBoundingClientRect()返回的结构体里，参数x和y是undefined，
    // 对应的值在left和top参数
    // 所以构建iOSRect时，判断如果x和y是undefined，则使用left和top参数
    var iOSRect = {
        x: htmlRect.x ? htmlRect.x : htmlRect.left,
        y: htmlRect.y ? htmlRect.y : htmlRect.top,
        width: htmlRect.width,
        height: htmlRect.height
    };
    return iOSRect;
}

/*
 add parameter of UTM Source to all links
*/
var updateLinkUTMSource = function() {
    var links = document.getElementsByTagName('a')
    for (var link of links) {
        var url = new URL(link.href)
        url.searchParams.set('utm_source', 'pindoo_rss')
        link.href = url.toString()
    }
}

/*
 twitter widget
*/
var loadTwitterWidget = function() {
    let tweets = document.getElementsByClassName('twitter-tweet')
    for (var i = 0; i < tweets.length; i++) {
        if (appearanceMode == 1) {
            tweets[i].setAttribute('data-theme', 'dark')
        }
        twttr.widgets.load(tweets[i])
    }
}

var switchTwitterWidgetAppearance = function() {
    const currentTheme = appearanceMode == 0 ? 'dark' : 'light'
    const targetTheme = appearanceMode == 0 ? 'light' : 'dark'
    var tweets = document.querySelectorAll('[data-tweet-id]')
    tweets.forEach(function(tweet) {
        var src = tweet.getAttribute("src")
        tweet.setAttribute("src", src.replace("theme=" + currentTheme, "theme=" + targetTheme))
    })
}

/*
 latex
*/
var changeLaTex = function(val) {
    renderLatex = val
    toggleLaTex()
}

var toggleLaTex = function() {
    if (renderLatex == 0) {
        var texScript = document.getElementById('texScript')
        if (texScript) {
            texScript.remove()
        }
        var mathScript = document.getElementById('mathScript')
        if (mathScript) {
            mathScript.remove()
        }
    } else {
        var check = document.getElementById('texScript')
        if (!check) {
            var baseTag = document.getElementById('baseTag')
            var texScript = document.createElement('script')
            texScript.src = filePath() + '/js/latex.js'
            texScript.id = 'texScript'
            document.head.insertBefore(texScript, baseTag)

            var mathScript = document.createElement('script')
            mathScript.src = filePath() + '/mathjax/tex-mml-chtml.js'
            mathScript.id = 'mathScript'
            mathScript.onload = function() {
                reRenderLaTex()
            }
            document.head.insertBefore(mathScript, baseTag)
        } else {
            reRenderLaTex()
        }
    }
}

/*
 highlight text
*/
var highlightText = function(textString) {
    var texts = textString
    if (deployment == 1) {
        var decodedData = b64DecodeUnicode(textString);
        var textObject = JSON.parse(decodedData);
        texts = textObject.keywords;
    }

    for (var i = 0; i < texts.length; i++) {
        var instance = new Mark(document.getElementById("merReader"))
        instance.mark(texts[i], {
        })
    }
}
