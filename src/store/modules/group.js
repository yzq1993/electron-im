export default {
	state:{
		group:[]
	},
	mutations:{
		updateGroup(state,data){
			state.group=data
		},
		insertGroup(state,data){
			state.group.unshift(data)
		},
		updateGroupOne(state,row={id:null,data:null}){
			let index=state.group.findIndex(v=>v.id==row.id),
				item=Object.assign({},state.group[index],row.data)
			state.group.splice(index,1,item)
		},
		deleteGroup(state,row={id:null}){
			let index=state.group.findIndex(v=>v.id==row.id)
			state.group.splice(index,1)
		}
	}
}