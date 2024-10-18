import  express  from "express";
import {Pool} from 'mysql2/promise'

export const createTestRouter= (myPool: Pool)=>{
  const router = express.Router();

  router.post('/',(req,res)=>{
    console.log('sono il router POST /api/test')
    res.json({
      'messaggio': 'ecco qui la risposta alla test post '
    })
  })

  router.get('/',(_,res)=>{
    console.log('ricevuta una get dal client'); 
    res.json({ response: {
        'messaggio':'Ricevuto il messaggio dal client!',
        'contenuto':'prototipo del contenuto'
      }
    });
  })

  return router
}
