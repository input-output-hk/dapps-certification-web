export const exportObjectToJsonFile = (objectData: any) => {
    let filename = "Testing Report.json";
    let contentType = "application/json;charset=utf-8;";
    const navigator = window.navigator as any;
    if (window.navigator && navigator.msSaveOrOpenBlob) {
      var blob = new Blob(
        [decodeURIComponent(encodeURI(JSON.stringify(objectData)))],
        { type: contentType }
      );
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var a = document.createElement("a");
      a.download = filename;
      a.href =
        "data:" +
        contentType +
        "," +
        encodeURIComponent(JSON.stringify(objectData));
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

export const formatToTitleCase = (value: string) => {
  if (value.indexOf(' ') !== -1) {
    return value.toLowerCase().split(' ').map((word) => {
      return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
  } else {
    const result = value.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult.trim();
  }
}