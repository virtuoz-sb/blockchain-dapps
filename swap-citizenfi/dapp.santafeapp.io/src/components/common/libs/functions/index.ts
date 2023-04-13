import jQuery from "jquery"
var alertify = require('alertifyjs')
const $ = jQuery


export default function makeid(length: number) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}

export const rounded = (num: any, rnds?: number) => {
  const num_type: string = typeof num
  if(num_type === 'number') return parseFloat(String(num.toFixed(rnds ? rnds : 2)))
  else if (num_type === 'string') return parseFloat(String(Number(num).toFixed(rnds ? rnds : 2)))
}

export function getRandomArbitrary(min: any, max: any) {
  let num: any = Math.random() * (max - min) + min
  return parseInt(num)
}
export function copyText(addr : string, message: any){
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(addr).select();
  document.execCommand("copy");
  $temp.remove();
  alertify.dismissAll();
  alertify.success(message)
}

export function humanize(str: any) {
  var i, frags = str.split('_');
  for (i=0; i<frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join(' ');
}

export function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(pass: string){
  if(pass.length < 7) return false
  if(pass.length > 15) return false
  var regexp = /^[a-zA-Z0-9-_!@#$%^&*]+$/;
  if (pass.search(regexp) === -1)return false
  return true
}

export function validateUrl(url: string){
  if(url.length < 5) return false
  if(url.length > 20) return false
  var regexp = /^[a-zA-Z0-9-_]+$/;
  if (url.search(regexp) === -1)return false
  else return true
}

export function getBalanceStr(val: any, decimal: number, dots?: number){
  let tmp: any = String(val / (10**decimal))
  var parts = tmp.toString().split('.');
  if(parts.length === 1) return tmp
  else if(parts.length === 2) return parts[0] + "." + parts[1].substring(0,dots ? dots : 2)
  return tmp
}

export function isInteger(str: string, sign?: boolean){
  if(/^\+?(0|[1-9]\d*)$/.test(str)){
    if(sign === true) return Number(str) > 0
    else return true
  }else return false
}

export function truncate(value: any)
{
  value = Number(value)
    if (value < 0) {
        return Math.ceil(value);
    }

    return Math.floor(value);
}

export function isNumeric(str: any, sign? : boolean) {
  if(typeof str === 'number') return true
  if (typeof str !== "string") return false // we only process strings!  
  if(sign === true) return !isNaN(Number(str)) && !isNaN(parseFloat(str)) && Number(str) >= 10 ** -18 // ...and ensure strings of whitespace fail
  else return !isNaN(Number(str)) && !isNaN(parseFloat(str))
}

export function toggleActive(sel: string, cls?: any){
  if(cls){
    $(sel).toggleClass("active")
    $(sel).toggleClass(cls)
  }else{
    $(sel).toggleClass("active")
  }
}

export function validateWalletAddres(addr: string){
  if(!addr) return false
  if(addr.length !== 42) return false
  var regexp = /^[a-zA-Z0-9]+$/;
  if (addr.search(regexp) === -1)return false
  else {
    return addr.substring(0, 2) === "0x"
  }
}

export function isValidHttpUrl(urlStr: string) {
  let url;
  
  try {
    url = new URL(urlStr);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function isSameAddress(a: any, b: any){
  return (a && b && a.length === 42 && b.length === 42 && (a.toLowerCase() === b.toLowerCase()))
}

export function shortAddress(addr: any){
  if(addr === "" || addr === null || !addr) return ""
  if(addr.length < 10) return addr
  return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4)
}

export function countWords(str: any) {
  return str.trim().split(/\s+/).length;
}

export function showError(msg: any){
  alertify.dismissAll()
  alertify.error(msg)
  return false
}

export function showSuccess(msg: any){
  alertify.dismissAll()
  alertify.success(msg)
  return true
}

export function getLeftDateTime(endTimestamp: any, curTimeStamp: any){
  if(curTimeStamp >= endTimestamp) return "Ended"
  let remain: number = parseInt(String(((endTimestamp - curTimeStamp)/1000)));
  let ss = remain%60
  remain = (remain - ss) / 60
  let mm = remain%60
  remain = (remain - mm) / 60
  let hh = remain%24
  remain = (remain - hh)/24

  let str_d: any = remain + "d "
  if(remain === 0) str_d = ""

  let str_h: any = hh + "h "
  // if(hh < 10) str_h = "0" + str_h
  if(hh === 0) str_h = ""

  let str_m: any = mm + "m "
  if(mm < 10) str_m = "0" + str_m
  if(mm === 0) {
    if(hh > 0)str_m = "00m "
    else str_m = "0m "
  }
  

  let str_s: any = ss + "s"
  if(ss < 10) str_s = "0" + str_s
  if(remain === 0) return str_h + str_m + str_s
  return str_d + str_h + str_m
}

export function convertSecond2DateTime(remain: number){
  remain = parseInt(String(remain));
  let ss = remain%60
  remain = (remain - ss) / 60
  let mm = remain%60
  remain = (remain - mm) / 60
  let hh = remain%24
  remain = (remain - hh)/24

  let str_d: any = remain + "d "
  if(remain === 0) str_d = ""

  let str_h: any = hh + "h "
  // if(hh < 10) str_h = "0" + str_h
  if(hh === 0) str_h = ""

  let str_m: any = mm + "m "
  if(mm < 10) str_m = "0" + str_m
  if(mm === 0) str_m = ""

  let str_s: any = ss + "s"
  if(ss < 10) str_s = "0" + str_s
  if(ss < 1) str_s = "00"
  if(remain < 1) return str_h + str_m + str_s
  return str_d + str_h + str_m + str_s
}

export function convertSecond2DateTimeSwapHistory(remain: number){
  remain = parseInt(String(remain));
  let totalSec: number = remain

  if(remain < 120) return remain + "s"
  let ss = remain%60
  remain = (remain - ss) / 60

  if(remain < 120) return remain + "m"
  let mm = remain%60
  remain = (remain - mm) / 60
  let hh = remain%24
  remain = (remain - hh)/24

  let str_d: any = remain + "d "
  if(remain === 0) str_d = ""

  let str_h: any = hh + "h "
  // if(hh < 10) str_h = "0" + str_h
  if(hh === 0) str_h = ""

  let str_m: any = mm + "m "
  if(mm < 10) str_m = "0" + str_m
  if(mm === 0) str_m = ""

  let str_s: any = ss + "s"
  if(ss < 10) str_s = "0" + str_s
  if(ss < 1) str_s = "00"
  if(remain < 1) return str_h + str_m
  return str_d + str_h
}

function formatAMPM(date: Date) {
  var hours = date.getHours();
  var minutes: any = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export function dateString(dateString: any){
  let d = new Date(dateString)
  var monthNames = [ "January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December" ];
  //20 June 2021 6:00pm
  return d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear() + " " + formatAMPM(d)//d.getDate() + " " + d.getMonth() + " " + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes()
}

export function tstmp2datetime(unix_timestamp: any){
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  if(unix_timestamp < 0.0000001) return "0:00:00:00"
  var date = new Date(Number(unix_timestamp) * 1000);
  // Hours part from the timestamp
  var dates = date.getDate();
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();
  if(date.getSeconds() < 0) seconds = "0"
  
  // Will display time in 10:30:23 format
  var formattedTime = dates + ":" + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  console.log("timestamp = ", unix_timestamp, formattedTime)
  return formattedTime
}




export function changeStorage(key: any, data: any){
  localStorage.setItem(key, JSON.stringify(data))
}

export function dynamicSort(property: any) {
  var sortOrder = 1;
  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  return function (a: any,b: any) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
  }
}