<template>
  <el-dialog title="个人信息" :visible.sync="value" width="600px" center :before-close="close">
   	<el-form label-width="60px" label-position="left">
   		<el-form-item label-width="0" class="avatarFrom">
				<div class="avatar">
					<img :src="user.avatar" v-if="user.avatar">
					<i class="el-icon-plus" v-else></i>
					<input type="file" @change=upload>
				</div>
			</el-form-item>
 			<el-form-item label="昵称">
				<el-input v-model="user.name"></el-input>
			</el-form-item>
			<el-form-item label="手机号">
				<el-input v-model="user.phone"></el-input>
			</el-form-item>
			<el-form-item label="性别">
				<el-radio v-model="user.sex" :label="1">男</el-radio>
  			<el-radio v-model="user.sex" :label="2">女</el-radio>
			</el-form-item>
			<el-form-item label="生日">
				<el-date-picker v-model="user.birth" type="date"></el-date-picker>
			</el-form-item>
			<el-form-item label="学校">
				<el-input v-model="user.school"></el-input>
			</el-form-item>
			<el-form-item label="所在地">
				<el-cascader :options="city" :props="{value:'name',label:'name',children:'sub'}" separator=" " popper-class="area"
				v-model="address" @change=updateAddress></el-cascader>
			</el-form-item>
			<el-form-item label="家乡">
				<el-cascader :options="city" :props="{value:'name',label:'name',children:'sub'}" separator=" " popper-class="area"
				v-model="hometown" @change=updateHometown></el-cascader>
			</el-form-item>
			<el-form-item label="公司">
				<el-input v-model="user.company"></el-input>
			</el-form-item>
			<el-form-item label="签名">
				<el-input type="textarea" v-model="user.summary" :rows=3></el-input>
			</el-form-item>
			<el-form-item label-width="0" style="text-align: center">
				<el-button type="primary" @click=save>确 定</el-button>
			</el-form-item>
   	</el-form>
  </el-dialog>
</template>

<script>
export default {
  data(){
    return {
    	city:require('@/assets/city.json'),
    	user:{
        
    	},
    	address:null,
    	hometown:null
    }
  },
  props:{
    value:{
      type:Boolean,
      default:false
    },
  },
  created(){
  	this.getUser()
  },
  methods:{
  	close(){
  		this.$emit('input',false)
  	},
  	getUser(){
  		let key
  		this.$ajax({
  			url:'/user',
  			params:{uid:this.$store.state.owner.uid}
  		}).then(res=>{
  			this.user=res
  			this.address=res.address?res.address.split(' '):[]
  			this.hometown=res.hometown?res.hometown.split(' '):[]
  		})
  	},
  	updateAddress(e){
  		this.user.address=this.address.join(' ')
  	},
  	updateHometown(e){
  		this.user.hometown=this.hometown.join(' ')
  	},
  	upload(event){
  		let file=event.target.files[0],
        formData=new FormData();
      formData.append('file',file);
      this.$ajax({
      	method:'post',
        url:'/upload',
        data:formData
      }).then(res=>{
      	this.user.avatar=res.url
      })
  	},
  	save(){
  		this.$ajax({
  			method:'post',
  			url:'/saveUser',
  			data:this.user
  		}).then(res=>{
  			this.$store.commit('updateOwner',{
  				name:this.user.name,
					avatar:this.user.avatar,
					summary:this.user.summary
  			})
  			this.close()
  		})
  	}
  }
}
</script>

<style scoped>
	.avatarFrom{
		display: flex;
		justify-content: center
	}
	.avatar{
		height: 100px;width: 100px;
		position: relative;
	}
	.avatar img{
		width: 100%;height: 100%;
		display: block
	}
	.avatar i{
		font-size: 36px;
		border: 1px solid #d8d8d8;
		width: 100%;height: 100%;
		display: flex;
		justify-content: center;
		align-items: center
	}
	.avatar input{
		position: absolute;top: 0;left: 0;
		opacity: 0;
		height: 100%;width: 100%;
		font-size: 0;
		cursor: pointer
	}
</style>
