import dayjs from "dayjs";

export const exportObjectToJsonFile = (objectData: any, filename: string) => {
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

export const formatToTitleCase = (value: string | undefined) => {
  if (!value) { return ''; }
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

export const formatTimeToReadable = (duration: number) => {
    const milliseconds = Math.floor(duration % 1000),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    let timeStr = '';
    if (hours) {
      timeStr += hours + 'h '
    }
    if (minutes) {
      timeStr += minutes + 'm '
    }
    if (seconds) {
      timeStr += seconds + 's '
    }
    if (milliseconds) {
      timeStr += milliseconds + 'ms'
    }
    return timeStr
}

export const getObjectByPath = (object: { [x: string]: any }, path: string): any => {
  path = path.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  path = path.replace(/^\./, ""); // strip a leading dot
  const a = path.split(".");
  let tempObj = JSON.parse(JSON.stringify(object))
  for (let i = 0, n = a.length; i < n; ++i) {
    const k = a[i];
    if (tempObj && k in tempObj) {
      tempObj = tempObj[k];
    } else {
      return;
    }
  }
  return tempObj;
};

export const transformEmptyStringToNullInObj = (obj: any) => {
  Object.keys(obj).forEach(key => {
    if (!obj[key]) {
      obj[key] = null
    } 
  })
  return obj;
}

// Deletes all the keys with empty strings from an object
export const removeEmptyStringsDeep = (obj: any) => {
  Object.keys(obj).forEach(key =>
    (obj[key] && typeof obj[key] === 'object' && removeEmptyStringsDeep(obj[key])) ||
    (obj[key] === '' && delete obj[key])
  );
  return obj;
};

// Deletes all the keys with null value from an object
export const removeNullsDeep = (obj: any) => {
  Object.keys(obj).forEach(key =>
    (obj[key] && typeof obj[key] === 'object' && removeEmptyStringsDeep(obj[key])) ||
    (obj[key] === null && delete obj[key])
  );
  return obj;
};

export const getErrorMessage = (errorObj: any) => {
  let errorMsg = "Something wrong occurred. Please try again later.";
    if (typeof errorObj === "string") {
      errorMsg = errorObj + " Please try again.";
    } else if (errorObj?.info) {
      errorMsg = errorObj.info + " Please try again.";
    } else if (errorObj?.response?.message) {
      errorMsg = errorObj?.response.message + " Please try again.";
    } else if (errorObj?.response?.data) {
      errorMsg = errorObj.response.statusText + " - " + errorObj.response.data;
    }
    return errorMsg;
}

export const ellipsizeString = (data: string, firstSet: number = 5, lastSet: number = 4) => {
  return data ? `${data.slice(0, firstSet)}...${data.slice(-lastSet)}` : '...'
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "inactive":
      return "text-yellow-500";
    case "active":
      return "text-lime-600";
  }
};

export const findCurrentSubscription = (subscriptions: any) => {
  let currentSubscription = subscriptions.find((sub: any) => sub.status === 'active')
  if (!currentSubscription) {
    // find latest subscription by sorting startDate
    const sortedSubs = [...subscriptions].sort((a: any, b: any) => {
      if (dayjs(a.startDate).isBefore(dayjs(b.startDate))) {
        return 1;
      } else if (dayjs(b.startDate).isBefore(dayjs(a.startDate))) {
        return -1;
      } else {
        return 0;
      }
    })
    if (sortedSubs[0]) {
      currentSubscription = sortedSubs[0]
    }
  }
  return currentSubscription
}