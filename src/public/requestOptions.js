

export const GET_TEST= { 
  url:'/api/test',
  options:{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }
}




export const POST_TEST={
  url:'/api/test',
  options:{
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      message:'ciao Server!'
    })
  }
}




export const POST_MACROREQUEST = {
  url: '/api/macro/',
  options: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      arrayMacrotopic: [
        { quantitySelected: 3, macroID: 1, isChecked: true },
        { quantitySelected: 5, macroID: 2, isChecked: false },
        { quantitySelected: 6, macroID: 3, isChecked: true },
        { quantitySelected: 4, macroID: 4, isChecked: false },
        { quantitySelected: 2, macroID: 5, isChecked: true },
      ]
    })
  }
};

export const POST_MICROREQUEST={
  url: '/api/micro',
  options:{
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      arrayMicroTopic:[
        { quantitySelected: 3, macroID: 1, microID: 101, isChecked: true },
        { quantitySelected: 5, macroID: 2, microID: 201,isChecked: false },
        { quantitySelected: 6, macroID: 3, microID: 302,isChecked: true },
        { quantitySelected: 4, macroID: 4, microID: 404,isChecked: false },
        { quantitySelected: 4, macroID: 4, microID: 405,isChecked: false },
        { quantitySelected: 2, macroID: 5, microID: 508,isChecked: true },
        { quantitySelected: 2, macroID: 5, microID: 509,isChecked: true },
      ]
    })
  }
}