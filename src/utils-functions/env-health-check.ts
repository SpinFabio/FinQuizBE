const envNameArray = [
  'DB_HOST',
  "DB_USER",
  'DB_PASSWORD',
  'DB_DATABASENAME',
  'QUIZ_LIMIT',
  'MACROTOPIC_LIMIT',
  'MACROTOPIC_ARRAY_LIMIT',
  'MICROTOPIC_LIMIT',
  'MICROTOPIC_ARRAY_LIMIT',
];




export default  function envHealthChecker(){
  
  const somethingIsNull=envNameArray.reduce((prev,current)=>{
    //console.log(`current${current} prev ${prev}, process.env ${!!process.env[current]}`)
    return prev && !!process.env[current]
  },true)

  if(!somethingIsNull){
    throw new Error('Errore nel caricamento delle variabili di ambiente controlla ci siano tutte! ')
  }

}
