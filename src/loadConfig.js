// import settings from './settings.yaml'

// const loadSettings = async () => {
//   const r = await fetch(settings)
//   console.log(await r.text())
// }

// loadSettings()

import settings from './settings.json'

const loadConfig = () => {
    return settings
}

export default loadConfig
