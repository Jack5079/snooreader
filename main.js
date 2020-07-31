/**
 * 
 * @type {<Type>(arr: Type[]) => Type}
 */
const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
function beep () {
  return new Promise((resolve) => {
    const gif = new Image()
    gif.src = "assets/static.gif"
    gif.classList.add("top")
    document.body.append(gif)
    const audioContext = new AudioContext()
    var bufferSize = 4096
    var whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)

    whiteNoise.onaudioprocess = function (ev) {
      var output = ev.outputBuffer.getChannelData(0)
      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
    }

    whiteNoise.connect(audioContext.destination)
    setTimeout(() => {
      audioContext.close()
      gif.remove()
      resolve()
    }, 1000)
  })
}

/** @param {string} text */
function say (text) {
  const voice = random(speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en-')))
  return new Promise((resolve) => {
    function check () {
      if (speechSynthesis.speaking) {
        setTimeout(check, 10)
      } else resolve()
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.voice = voice
    speechSynthesis.speak(utter)
    check()
  })
}

/**
 * @type {HTMLTemplateElement | null}
*/
const template = document.querySelector("article#comment");
(async () => {
  var [
    { data: { children: [{ data: { title, author } }] } },
    { data: { children } },
  ] = await fetch("https://www.reddit.com/r/AskReddit/comments/i0orws/.json", {
    cache: "force-cache",
  })
    .then((res) => res.json())
  children = children.filter(comment => comment.data.body)
  template.querySelector("h1").innerText = title
  template.querySelector("a").innerText = author
  template.querySelector("a").href = `https://reddit.com/u/${author}`
  await say(title)
  template.querySelector("h1")?.remove()
  await beep()
  while (true) {
    const data = random(children)
    children = children.filter(comment => comment != data)
    const { data: comment } = data
    console.log(comment)
    template.querySelector("p").innerText = comment.body
    template.querySelector("a").innerText = comment.author
    template.querySelector("a").href = `https://reddit.com/u/${comment.author}`
    await say(comment.body)
    await beep()
  }
})()
