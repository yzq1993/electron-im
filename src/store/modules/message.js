export default {
	state:{
		message:[]
	},
	mutations:{
		updateMessage(state,data){
			state.message=data
		},
		sortMessage(state){
			state.message.sort((a,b)=>new Date(b.time)-new Date(a.time))
		},
		insertMessage(state,data){
			state.message.unshift(data)
		},
		updateMessageOne(state,row={id:null,data:null}){
			let index=state.message.findIndex(v=>v.room_id==row.id),
				item=Object.assign({},state.message[index],row.data)
			state.message.splice(index,1,item)
		},
		deleteMessage(state,row={id:null}){
			let index=state.message.findIndex(v=>v.room_id==row.id)
			state.message.splice(index,1)
		}
	}
}