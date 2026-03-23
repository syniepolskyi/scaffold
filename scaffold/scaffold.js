function sendForm()
{
  const formElem = document.getElementById(`file_scaffold_form`)
  const fileInput = document.getElementById(`scaffold_file`)
  const fileTextElem = document.getElementById(`scaffold_text`)
  const statusElement = document.getElementById(`scaffold_status`)
  const scaffoldFilename = document.getElementById(`scaffold_filename`).value
  const scaffoldDir = document.getElementById(`scaffold_dir`).value
  const file = fileInput.files[0]
  if(!file && !fileTextElem.value)
  {
    statusElement.textContent = `Please select a file or input File content`
    return
  }
  if(!scaffoldFilename.trim())
  {
    statusElement.textContent = `Please input File name`
    return
  }
  if(!scaffoldDir.trim())
  {
    statusElement.textContent = `Please input Destination directory`
    return
  }
  statusElement.textContent = `Uploading...`
  const formData = new FormData()
  if(file)
  {
    formData.append(`scaffold_file`, file)
  }
  formData.append(`scaffold_action`, `SAVE`)
  formData.append(`scaffold_dir`, scaffoldDir)
  formData.append(`scaffold_filename`, scaffoldFilename)
  formData.append(`scaffold_text`, fileTextElem.value)
  const uploadUrl = formElem.getAttribute(`action`)
  fetch(uploadUrl,
  {
    method: `POST`,
    body: formData
  }).then(response =>
  {
    if(!response.ok)
    {
      statusElement.textContent = `Response error, status: ${response.status}`
    }
    return response.json()
  }).then(data =>
  {
    statusElement.textContent = `Response data: ${JSON.stringify(data)}`
  })
}

function fileRead()
{
  const formElem = document.getElementById(`file_scaffold_form`)
  const scaffoldFilename = document.getElementById(`scaffold_filename`).value
  const scaffoldDir = document.getElementById(`scaffold_dir`).value
  const formData = new FormData()
  const uploadUrl = formElem.getAttribute(`action`)
  formData.append(`scaffold_action`, `READ`)
  formData.append(`scaffold_dir`, scaffoldDir)
  formData.append(`scaffold_filename`, scaffoldFilename)
  fetch(uploadUrl,
  {
    method: `POST`,
    body: formData
  }).then(r =>
  {
    if(!r.ok)
    {
      const statusElement = document.getElementById(`scaffold_status`)
      statusElement.textContent = `File read error, status: ${r.status}`
    }
    return r.text()
  }).then(text =>
  {
    const fileTextElem = document.getElementById(`scaffold_text`)
    const statusElement = document.getElementById(`scaffold_status`)
    fileTextElem.value = text
    statusElement.innerText = ``
  })
}

function dirScan()
{
  const formElem = document.getElementById(`file_scaffold_form`)
  const dirItemsElem = document.getElementById(`scaffold_dir_items`)
  const dirItemsMsgElem = document.getElementById(`scaffold_dir_items_msg`)
  const scaffoldDir = document.getElementById(`scaffold_dir`).value
  const formData = new FormData()
  const uploadUrl = formElem.getAttribute(`action`)
  formData.append(`scaffold_action`, `SCAN`)
  formData.append(`scaffold_dir`, scaffoldDir)
  dirItemsElem.innerHTML = ``
  dirItemsMsgElem.innerHTML = ``
  fetch(uploadUrl,
  {
    method: `POST`,
    body: formData
  }).then(r =>
  {
    if(!r.ok)
    {
      dirItemsElem.innerHTML =`<li>Dir scan error, status: ${r.status}</li>`
    }
    return r.json()
  }).then(data =>
  {
    const statusElement = document.getElementById(`scaffold_status`)
    statusElement.innerText = ``
    if(data && data.error)
    {
      dirItemsMsgElem.innerText =`Dir scan error, status: ${data.error}`
    }
    if(data && data.length && !data.error)
    {
      dirItemsElem.innerHTML = data
        .filter(it => !(it === `./` || it === `../`))
        .map(it => `<li><a href="#" 
            data-file="${it.replace(/"/g,"&quot;").replace(/</g,"&lt;")}">
            ${it.replace(/"/g,"&quot;").replace(/</g,"&lt;")}</a></li>`)
        .join(``)
      const dClear = `data-clear="scaffold_dir_items"`
      dirItemsMsgElem.innerHTML = `<a href="#" ${dClear}>[clear]</a>`
      const dirUpElem = document.getElementById(`scaffold_dir_up`)
      dirUpElem.innerHTML = `<a href="#" data-dir="up">[ .. UP .. ]</a>`
      document.querySelector(`a[data-dir="up"]`).addEventListener(`click`, (evt) =>
      {
        evt.preventDefault()
        const scaffoldDir = document.getElementById(`scaffold_dir`).value
        const parts = scaffoldDir.split(`/`)
        const newParts = []
        for(let i = 0; i < parts.length; i++)
        {
          if(parts[i] !== ``)
          {
            newParts.push(parts[i])
          }
        }
        newParts.pop()
        document.getElementById(`scaffold_dir`).value = 
          `/${newParts.join("/") + ((newParts.length > 0) ? "/" : "")}`
        dirScan()
      })
      document.querySelector(`a[${dClear}]`).addEventListener(`click`, (evt) =>
      {
        evt.preventDefault()
        const dirItemsElem = document.getElementById(`scaffold_dir_items`)
        const dirItemsMsgElem = document.getElementById(`scaffold_dir_items_msg`)
        const dirUpElem = document.getElementById(`scaffold_dir_up`)
        dirItemsElem.innerHTML = ``
        dirItemsMsgElem.innerHTML = ``
        dirUpElem.innerHTML = ``
      })
      document.querySelectorAll(`a[data-file]`).forEach(ela =>
      {
        ela.addEventListener(`click`, (eva)=>
        {
          eva.preventDefault()
          const fileName = eva.target.getAttribute(`data-file`)
          if(fileName.at(-1) === `/`)
          {
            const curDirValue = document.getElementById(`scaffold_dir`).value
            document.getElementById(`scaffold_dir`).value = curDirValue + fileName
            dirScan()
          }
          else
          {
            document.getElementById(`scaffold_filename`).value = fileName
            fileRead()
          }
        })
      })
    }
  })
}

const formElem = document.getElementById(`file_scaffold_form`)
formElem.addEventListener(`submit`, (ev) =>
{
  ev.preventDefault()
  if(document.activeElement && document.activeElement.id === `scaffold_filename`)
  {
    fileRead()
    return
  }
  if(document.activeElement && document.activeElement.id === `scaffold_dir`)
  {
    dirScan()
    return
  }
  const confSubElem = document.getElementById(`confirmed_submit`)
  const statusElement = document.getElementById(`scaffold_status`)
  statusElement.innerText = ``
  if(confSubElem.getAttribute(`style`))
  {
    confSubElem.setAttribute(`style`, ``)
  }
  else
  {
    confSubElem.setAttribute(`style`, `display: none;`)
  }
})

const fileInputElem = document.getElementById(`scaffold_file`)
fileInputElem .addEventListener(`change`, (ev) =>
{
  const fileName = ev.target.files[0] ? ev.target.files[0].name : ``
  const fileLabelElem = document.querySelector(`label[for="scaffold_file"]`)
  const fileTextContainerElem = document.getElementById(`scaffold_text`).parentNode
  fileLabelElem.innerText = `[File]`
  fileTextContainerElem.setAttribute(`style`, ``)
  if(fileName.length > 0)
  {
    fileTextContainerElem.setAttribute(`style`, `display: none;`)
    fileLabelElem.innerText = `[File]: ${fileName}`
  }
})

const confSubElem = document.getElementById(`confirmed_submit`)
confSubElem.addEventListener(`click`, (ev) =>
{
  ev.preventDefault()
  sendForm()
  confSubElem.setAttribute(`style`, `display: none;`)
})

const fileReadElem = document.getElementById(`scaffold_read`)
fileReadElem.addEventListener(`click`, (ev) =>
{
  ev.preventDefault()
  fileRead()
})

const dirScaElem = document.getElementById(`scaffold_scan`)
dirScaElem.addEventListener(`click`, (ev) =>
{
  ev.preventDefault()
  dirScan()
})

const saveTextEl = document.getElementById(`scaffold_save`)
saveTextEl.addEventListener(`click`, (ev) =>
{
  ev.preventDefault()
  sendForm()
  const confSubElem = document.getElementById(`confirmed_submit`)
  confSubElem.setAttribute(`style`, `display: none;`)
})
