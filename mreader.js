Vue.component('blog-post', {
    props: {
        post: Object,
        content_style: Object
    },
    template: `
        <div id="articleContent" v-bind:style="content_style">
            <div class="mer_caption"><span v-html="post.pubDate"></span></div>
            <div v-html="post.title" class="mer_title"></div>
            <div class="mer_caption medium">
                <span v-html="post.author"></span>
                <span><a v-bind:href="post.url" v-html="post.publisher"></a></span>
            </div>
            <div v-html="post.content" class="mer_body"></div>
        </div>
    `
})

Vue.component({
    props: {},
    template: `
    `
})

var vm = new Vue({
    el: '#merReader',
    data: {
        windowsWidth: window.innerWidth,
        deployment: 1, // 0: Web; 1: iOS; 2: Android
        fontSize: 1, // 0,1,2,3,4
        appearanceMode: 0, // 0: Light; 1: Dark
        mediaWidth: 0, // 0: Full-width; 1: Text-align-width
        fontFamily: 0,
        renderLatex: 0,
        filePath: '',
        post: {
            url: '',
            baseUrl: '',
            title: '',
            pubDate: '',
            author: '',
            publisher: '',
            lang: '',
            content: `
            <p></p>
            `
        },
        actionPanel: {
            appearance: 'Appearance',
            textSize: 'Text Size',
            imageWidth: 'Image Width',
            highlight: 'Highlight'
        }
    },
    computed: {
        maxWidth: function() {
            return this.windowsWidth >= 992 ? 850 : 992
        },
        contentPadding() {
            return this.windowsWidth >= 576 ? '30px 60px 100px' : '18px 15px 150px'
        },
        contentStyle() {
            let spacing = this.windowsWidth >= 576 ? '0.5px' : 'normal'
            return {
                padding: this.contentPadding,
                letterSpacing: spacing
            }
        },
        containerBorder() {
            return this.windowsWidth >= 992 ? '1px solid #ededed' : 'none'
        },
        containerInlineStyle: function() {
            return {
                maxWidth: this.maxWidth + 'px',
                border: this.containerBorder
            }
        },
        containerClass: function() {
            return {
                mer_light: this.appearanceMode == 0,
                mer_dark: this.appearanceMode == 1,
                media_full_width: this.mediaWidth == 0,
                media_text_width: this.mediaWidth == 1,
                athelas: this.fontFamily == 1,
                charter: this.fontFamily == 2,
                georgia: this.fontFamily == 3,
                apple_system_ui_serif: this.fontFamily == 9,
                palatino: this.fontFamily == 4,
                seravek: this.fontFamily == 5,
                times_new_roman: this.fontFamily == 6,
                source_han_sans: this.fontFamily == 7,
                source_han_serif: this.fontFamily == 8
            }
        }
    },
    watch: {
        windowsWidth: function(newWidth, oldWidth) {
            console.log('Window width changed to ' + newWidth + ' from ' + oldWidth)
        },
        appearanceMode: function() {
            console.log('New appearance mode: ' + this.appearanceMode)
            this.switchTwitterWidgetAppearance()
        },
        fontSize: function() {
            this.updateHTMLClass()
        },
        renderLatex: function() {
            this.toggleLaTex()
        }
    },
    created() {
        this.updateHTMLClass()
        this.updateDynamicStyle()
        this.updateStaticStyle()
    },
    mounted() {
        var path = window.location.href
        this.filePath = path.substring(0, path.length - 12)
        console.log('file path: ' + this.filePath);
        this.$nextTick(function() {
            // Code that will run only after the entire view has been rendered
            window.addEventListener('resize', this.onResize)
        })
    },
    updated() {
        this.$nextTick(function() {
            // Code that will run only after the entire view has been re-rendered
            console.log('updated()')
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
            this.handleImages()
            this.loadTwitterWidget()
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        changePost: function(newPost) {
            let html = document.documentElement
            let base = document.getElementById('baseTag')
            let post
            if (this.deployment == 0) {
                html.setAttribute('lang', newPost.lang)
                base.href = newPost.baseUrl + '/'
                post = {
                    url: newPost.url,
                    baseUrl: newPost.baseUrl,
                    title: newPost.title,
                    pubDate: newPost.pubDate,
                    author: newPost.author,
                    publisher: newPost.publisher,
                    lang: newPost.lang,
                    content: this.decodeHTMLContent(newPost.content)
                }
            } else if (this.deployment == 1) {
                const decodedData = this.b64DecodeUnicode(newPost)
                const postObj = JSON.parse(decodedData)
                html.setAttribute('lang', postObj.langCode)
                base.href = postObj.baseUrl + '/'
                post = {
                    url: postObj.articleUrl,
                    baseUrl: postObj.baseUrl,
                    title: postObj.title,
                    pubDate: postObj.pubDate,
                    author: postObj.author,
                    publisher: postObj.feedTitle,
                    lang: postObj.langCode,
                    content: this.decodeHTMLContent(postObj.content)
                }
            }
            this.post = post
        },
        changeAppearance: function(val) {
            this.appearanceMode = val
        },
        changeMediaWidth: function(val) {
            this.mediaWidth = val
        },
        changeFontSize: function(val) {
            this.fontSize = val
        },
        changeFontFamily: function(val) {
            this.fontFamily = val
        },
        changeLaTex: function(val) {
            if (this.renderLatex == val) {
                this.toggleLaTex()
            } else {
                this.renderLatex = val
            }
        },
        updateHTMLClass: function() {
            let html = document.documentElement || document.getElementsByTagName('html')[0]
            const size = parseInt(this.fontSize) // fontSize might be string value
            switch (size) {
                case 0:
                    html.classList.remove('mer_medium', 'mer_large', 'mer_xlarge', 'mer_xxlarge')
                    html.classList.add('mer_small')
                    break
                case 1:
                    html.classList.remove('mer_large', 'mer_xlarge', 'mer_xxlarge')
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
                    break;
            }
        },
        updateStaticStyle: function() {
            let style = document.getElementById('staticStyle')
            var scale = 1 / window.devicePixelRatio
            style.innerHTML = `
            hr {height: ${scale}px;}
            table, th, td {border: ${scale}px solid #979795;}
            `
        },
        updateDynamicStyle: function() {
            if (this.mediaWidth == 0) {
                let style = document.getElementById('dynamicStyle')
                let container = document.getElementById('merReader')
                let rect = container.getBoundingClientRect()
                let width = this.windowsWidth >= 992 ? this.maxWidth : rect.width
                let margin = this.windowsWidth >= 576 ? '.93em -60px' : '.93em -15px'
                style.innerHTML = `
                .media_full_width #articleContent img,
                .media_full_width #articleContent iframe:not([id^=twitter-widget]),
                .media_full_width #articleContent video {
                    max-width: ${width}px;
                    margin: ${margin};
                }
                `
            }
        },
        onResize: function() {
            this.windowsWidth = window.innerWidth
            this.updateDynamicStyle()
        },
        handleImages: function() {
            const imgs = document.querySelectorAll('img')
            for (let img of imgs) {
                if (img.complete) {
                    this.handleSmallImage(img, img.naturalWidth)
                } else {
                    img.onload = function() {
                        vm.handleSmallImage(this, this.naturalWidth)
                    }
                }

                // add click function to images
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
                    if (vm.deployment == 0) {
                        console.log(imageInfo)
                    } else if (vm.deployment == 1) {
                        // 将onclick监听事件和相关参数传给Swift调用
                        window.webkit.messageHandlers.imageTapped.postMessage(imageInfo);
                    }
                }
            }
        },
        getImageRectBy: function (urlString) {
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
        },
        handleSmallImage: function(img, naturalWidth) {
            let container = document.getElementById('merReader')
            let rect = container.getBoundingClientRect()
            let contentWidth = this.windowsWidth >= 992 ? this.maxWidth : rect.width
            let contentDiv = document.getElementById('articleContent')
            if (contentDiv == null) {
                return
            }
            let padding = this.windowsWidth >= 576 ? 60 : 15
            let expectedWidth = this.mediaWidth == 0 ? contentWidth : (contentWidth - padding * 2)

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
                if (vm.mediaWidth == 0) {
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

        },
        loadTwitterWidget: function() {
            let tweets = document.getElementsByClassName('twitter-tweet')
            for (var i = 0; i < tweets.length; i++) {
                if (this.appearanceMode == 1) {
                    tweets[i].setAttribute('data-theme', 'dark')
                }
                twttr.widgets.load(tweets[i])
            }
        },
        switchTwitterWidgetAppearance: function() {
            const currentTheme = this.appearanceMode == 0 ? 'dark' : 'light'
            const targetTheme = this.appearanceMode == 0 ? 'light' : 'dark'
            var tweets = document.querySelectorAll('[data-tweet-id]')
            tweets.forEach(function(tweet) {
                var src = tweet.getAttribute("src")
                tweet.setAttribute("src", src.replace("theme=" + currentTheme, "theme=" + targetTheme))
            });
        },
        highlightText: function(textString) {
            var texts = textString
            if (this.deployment == 1) {
                var decodedData = this.b64DecodeUnicode(textString);
                var textObject = JSON.parse(decodedData);
                texts = textObject.keywords;
            }

            for (var i = 0; i < texts.length; i++) {
                var instance = new Mark(document.getElementById("merReader"))
                instance.mark(texts[i], {
                });
            }
        },
        decodeHTMLContent: function(content) {
            var textArea = document.createElement('textarea')
            textArea.innerHTML = content
            return textArea.value
        },
        b64DecodeUnicode: function(objString) {
            return decodeURIComponent(atob(objString).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        },
        toggleLaTex: function() {
            if (this.renderLatex == 0) {
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
                    texScript.src = this.filePath + '/js/latex.js'
                    texScript.id = 'texScript'
                    document.head.insertBefore(texScript, baseTag)

                    var mathScript = document.createElement('script')
                    mathScript.src = this.filePath + '/mathjax/tex-mml-chtml.js'
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
    }
})
