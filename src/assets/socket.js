import io from 'socket.io-client';
import {Notification} from 'element-ui'
let url

if(process.env.NODE_ENV === 'production'){
	url='https://www.yzqroom.cn'
}else{
	url='http://localhost:3300'
}
var socket
export default {
	connect(token){
		socket=io(url,{query:{token}})
		socket.on('error',(err)=>{
			Notification({
				type:'error',
				message:err||'socket异常',
				duration:1500
			})
		})
	},
	emit(event,res){
		socket.emit(event,res)
	},
	on(event,cb){
		socket.on(event,cb)
	}
}