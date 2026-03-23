const srcElems = document.querySelectorAll(`[src]`)
srcElems.forEach(el =>
{
  let src = el.getAttribute(`src`)
  if(src.indexOf(`?v=`) > 0)
  {
    el.setAttribute(`src`, src.replace(`?v=`, `?v=${(new Date()).getTime()}`))
  }
})

const hrefElems = document.querySelectorAll(`[href]`)
hrefElems.forEach(el =>
{
  let h = el.getAttribute(`href`)
  if(h.indexOf(`?v=`) > 0)
  {
    el.setAttribute(`href`, h.replace(`?v=`, `?v=${(new Date()).getTime()}`))
  }
})