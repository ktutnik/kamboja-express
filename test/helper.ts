export function delay(millisecond = 5){
    return new Promise((resolve, reject)=>{
        setTimeout(()=> {
            resolve()
        }, millisecond)
    })
}