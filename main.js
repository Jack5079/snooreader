
/**
 * @type {HTMLTemplateElement | null}
*/
const template = document.querySelector('article#comment');

/* eslint-env browser */
/**
 *
 * @type {<Type>(arr: Type[]) => Type}
 */
const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
function beep () {
  return new Promise((resolve) => {
    // const gif = new Image()
    // gif.src = 'assets/static.gif'
    // gif.classList.add('top')
    // document.body.append(gif)
    document.querySelector('canvas').hidden = false
    template.hidden = true
    const audioContext = new AudioContext()
    const bufferSize = 4096
    const whiteNoise = audioContext.createScriptProcessor(bufferSize, 1, 1)

    whiteNoise.addEventListener('audioprocess',  (ev) => {
      const output = ev.outputBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
    })

    whiteNoise.connect(audioContext.destination)
    setTimeout(() => {
      audioContext.close()
      // gif.remove()
      document.querySelector('canvas').hidden = true
      template.hidden = false
      resolve()
    }, 1000)
  })
}

/** @param {string} text @param {HTMLElement} [paragraph] */
function say (text, paragraph) {
  const voice = random(speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en-')))
  let handle
  return new Promise((resolve) => {
    function check () {
      if (speechSynthesis.speaking) {
        handle = requestAnimationFrame(check)
      } else {
        cancelAnimationFrame(handle)
        resolve()
      }
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.voice = voice
    if (paragraph) {
      paragraph.innerText = ""
    }
    utter.addEventListener('boundary', function (event) {
      if (paragraph) {
        paragraph.innerText = text.substring(0,event.charIndex + event.charLength)
      }
    });
    speechSynthesis.speak(utter)
    check()
  })
}

(async () => {
  let [
    { data: { children: [{ data: { title, author } }] } },
    { data: { children } }
  ] = await fetch('https://www.reddit.com/r/AskReddit/comments/mjvfa0/.json', {
    cache: 'force-cache'
  })
    .then((res) => res.json())
  children = children.filter(comment => comment.data.body)
  template.querySelector('h1').innerText = title
  template.querySelector('a').innerText = author
  template.querySelector('a').href = `https://reddit.com/u/${author}`
  await say(title)
  template.querySelector('h1')?.remove()
  await beep()
  while (true) {
    const data = random(children)
    children = children.filter(comment => comment !== data)
    const { data: comment } = data
    console.log(comment)
    template.querySelector('p').innerText = comment.body
    template.querySelector('a').innerText = comment.author
    template.querySelector('a').href = `https://reddit.com/u/${comment.author}`
    await say(comment.body, template.querySelector('p'))
    await beep()
  }
})()
