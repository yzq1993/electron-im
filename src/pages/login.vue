<template>
  <section class="login">
    <div class="login_head">
      <i class="el-icon-minus" @click=minimize></i>
      <i class="el-icon-close" @click=closeMain></i>
    </div>
    <el-form class="loginBox" v-if="isLogin==1">
      <el-form-item>
        <el-input type="text" v-model="form.email" placeholder="请输入账号">
          <div slot="prepend" style="width:45px">账号</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" v-model="form.password" placeholder="请输入密码">
          <div slot="prepend" style="width:45px">密码</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.code" placeholder="请输入验证码" v-number=0 @keyup.native.enter=login>
          <div slot="prepend" style="width:45px">验证码</div>
          <img slot="append" :src=codeImg @click=getCode>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click=login>登 录</el-button>
        <el-button type="text" @click=changeTab(2)>注册账号</el-button>
        <el-button type="text" @click=changeTab(3)>忘记密码</el-button>
      </el-form-item>
    </el-form>
    <el-form class="loginBox" v-else-if="isLogin==2">
      <el-form-item>
        <el-input type="text" v-model="form.email" placeholder="请输入邮箱">
          <div slot="prepend" style="width:45px">邮箱</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.code" placeholder="请输入验证码" v-number=0>
          <div slot="prepend" style="width:45px">验证码</div>
          <div slot="append" style="width:60px" @click=sendCode v-if="!codeTime">获取验证码</div>
          <div slot="append" style="width:60px" v-else>{{codeTime}}s</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" v-model="form.password" placeholder="请输入密码">
          <div slot="prepend" style="width:45px">密码</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" v-model="form.repassword" placeholder="请输入确认密码">
          <div slot="prepend" style="width:45px">确认密码</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.name" placeholder="请输入用户名">
          <div slot="prepend" style="width:45px">用户名</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click=register>注 册</el-button>
        <el-button type="text" @click=changeTab(1)>去登录</el-button>
      </el-form-item>
    </el-form>
    <el-form class="loginBox" v-else>
      <el-form-item>
        <el-input type="text" v-model="form.email" placeholder="请输入邮箱">
          <div slot="prepend" style="width:45px">邮箱</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.code" placeholder="请输入验证码" v-number=0>
          <div slot="prepend" style="width:45px">验证码</div>
          <div slot="append" style="width:60px" @click=sendCode v-if="!codeTime">获取验证码</div>
          <div slot="append" style="width:60px" v-else>{{codeTime}}s</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" v-model="form.password" placeholder="请输入密码">
          <div slot="prepend" style="width:45px">密码</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" v-model="form.repassword" placeholder="请输入确认密码">
          <div slot="prepend" style="width:45px">确认密码</div>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click=changePwd>确 定</el-button>
        <el-button type="text" @click=changeTab(1)>去登录</el-button>
      </el-form-item>
    </el-form>
    <canvas id="J_loginBackground" ></canvas>
  </section>
</template>

<script>
  import { render } from '@/assets/canvas'
  import socket from '@/assets/socket'
  export default {
    data () {
      return {
        isLogin:1, //1 登录 2注册 3找回密码，
        form: {
          email: null,
          password: null,
          repassword: null,
          code:null,
          name:null
        },
        codeImg:null,
        codeTime:null
      }
    },
    created(){
      this.getCode()
    },
    mounted(){
      render()
      window.addEventListener('resize',render)
    },
    methods: {
      minimize(){
        this.$electron.remote.getCurrentWindow().minimize()
      },
      closeMain(){
        this.$electron.remote.getCurrentWindow().close()
      },
      changeTab(e){
        this.isLogin=e
        if(this.isLogin==1){
          this.getCode()
        }else{
          this.codeTime=null
        }
        this.form={
          email: null,
          password: null,
          repassword: null,
          code:null,
          name:null
        }
      },
      getCode(){
        //this.codeImg=(process.env.NODE_ENV === 'production'?'https://www.yzqroom.cn':'http://localhost:3300')+'/im/loginCode?time='+(new Date()).getTime()
        this.codeImg='https://www.yzqroom.cn'+'/im/loginCode?time='+(new Date()).getTime()
      },
      sendCode(){
        if(this.isLogin==1){return false}
        if(this.codeTime){return false}
        if(!this.form.email){
          this.$error('请输入邮箱')
          return false
        }
        let type=this.isLogin==2?'reg':'pwd'
        this.codeTime=59
        this.setInterval=setInterval(()=>{
          if(this.codeTime){
            this.codeTime--
          }else{
            clearInterval(this.setInterval)
          }
        },1000)
        this.$ajax({
          url:'/sendCode',
          params:{email:this.form.email,type:type}
        }).then(res=>{
          
        })
      },
      login(){
        if(!this.form.email||!/^(\w|\d|\_)+\@(\w|\d)+\.(\w|\d)+$/.test(this.form.email)){
          this.$error('请输入账号')
          return false
        }
        if(!this.form.password){
          this.$error('请输入密码')
          return false
        }
        if(!this.form.code){
          this.$error('请输入验证码')
          return false
        }
        this.$ajax({
          url:'/login',
          method:'post',
          data:this.form
        }).then(res=>{
          socket.connect(res.headers.session)
          sessionStorage.token=res.headers.session
          this.$router.push('/')
        })
      },
      register(){
        if(!this.form.email||!/^(\w|\d|\_)+\@(\w|\d)+\.(\w|\d)+$/.test(this.form.email)){
          this.$error('请输入邮箱')
          return false
        }
        if(!this.form.code){
          this.$error('请输入验证码')
          return false
        }
        if(!this.form.password){
          this.$error('请输入密码')
          return false
        }
        if(!this.form.repassword){
          this.$error('请输入确认密码')
          return false
        }
        if(this.form.password!=this.form.repassword){
          this.$error('两次密码不一致')
          return false
        }
        this.$ajax({
          url:'/register',
          method:'post',
          data:this.form
        }).then(res=>{
          this.changeTab(1)
        })
      },
      changePwd(){
        if(!this.form.email||!/^(\w|\d|\_)+\@(\w|\d)+\.(\w|\d)+$/.test(this.form.email)){
          this.$error('请输入邮箱')
          return false
        }
        if(!this.form.code){
          this.$error('请输入验证码')
          return false
        }
        if(!this.form.password){
          this.$error('请输入密码')
          return false
        }
        if(!this.form.repassword){
          this.$error('请输入确认密码')
          return false
        }
        if(this.form.password!=this.form.repassword){
          this.$error('两次密码不一致')
          return false
        }
        this.$ajax({
          url:'/changePwd',
          method:'post',
          data:this.form
        }).then(res=>{
          this.changeTab(1)
        })
      }
    }
  }
</script>

<style scoped>
 .login{
    position: fixed;
    z-index: 0;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: #111;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-app-region: drag
  }
  .login_head{
    position: absolute;top: 0;right: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    -webkit-app-region: no-drag;
  }
  .login_head i{
    color: #fff;
    background: rgba(255,255,255,0.1);
    cursor: pointer;
    margin-right: 5px;
    padding: 5px;
    font-size: 15px
  }
  .loginBox{
    -webkit-app-region: no-drag;
    width: 400px;
    background: rgba(255,255,255,0.1);
    padding:30px;
    border-radius: 25px;
  }
  .loginBox>>>.el-input-group__append{
    cursor: pointer
  }
  .loginBox>>>.el-input-group__append div{
    text-align: center
  }
  #J_loginBackground{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;left: 0;
    z-index: -1
  }
</style>
