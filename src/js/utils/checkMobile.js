export function checkMobile() {
  const deviceMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /IEMobile/i
    // /Opera Mini/i,
  ]

  return (
    navigator.userAgentData?.mobile ||
    deviceMatch.some(regExp => {
      navigator.userAgent?.match(regExp)
    })
  )
}