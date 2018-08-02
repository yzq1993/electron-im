export default {
	state:{
		friend:[],
	},
	mutations:{
		updateFriend(state,data){
			state.friend=data
		},
		insertFriendGroup(state,data){
			state.friend.push(data)
		},
		deleteFriendGroup(state,row={id:null}){
			let index=state.friend.findIndex(v=>v.group_id==row.id)
			state.friend.splice(index,1)
		},
		updateFriendGroup(state,row={group_id:null,data:null}){
			let index=state.friend.findIndex(v=>v.group_id==row.group_id),
				item=Object.assign({},state.friend[index],row.data)
			state.friend.splice(index,1,item)
		},
		insertFriend(state,row={group_id:null,data:null}){
			state.friend.forEach(v=>{
				if(v.group_id==row.group_id){
					v.children.push(row.data)
				}
			})
		},
		insertFriends(state,row={group_id:null,data:null}){
			state.friend.forEach(v=>{
				if(v.group_id==row.group_id){
					v.children.push(...row.data)
				}
			})
		},
		updateFriendOne(state,row={uid:null,data:null}){
			let item,index
			state.friend.forEach(v=>{
				index=v.children.findIndex(m=>m.uid==row.uid)
				if(index==-1){return false}
				item=Object.assign({},v.children[index],row.data)
				v.children.splice(index,1,item)
			})
		},
		deleteFriend(state,row={uid:null}){
			let index
			state.friend.forEach(v=>{
				index=v.children.findIndex(m=>m.uid==row.uid)
				if(index==-1){return false}
				v.children.splice(index,1)
			})
		}
	}
}