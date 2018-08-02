import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	state:{
		message:[],
		friend:[],
		group:[],
		user:{
			show:false,
			top:0,
			left:0,
			uid:null
		},
		owner:{
			uid:null,
			name:null,
			avatar:null,
			summary:null
		}
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
		},
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
					v.push(data)
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
		},
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
		},
		updateUser(state,data){
			state.user=Object.assign({},state.user,data)
		},
		updateOwner(state,data){
			state.owner=Object.assign({},state.owner,data)
		}
	}
})
export default store