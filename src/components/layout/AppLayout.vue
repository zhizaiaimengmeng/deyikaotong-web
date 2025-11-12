<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="container">
        <h1>德易考通</h1>
        <nav class="main-nav">
          <router-link to="/">首页</router-link>
          <router-link to="/level-courses">课程级别</router-link>
        </nav>
      </div>
    </header>
    
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AppLayout'
}
</script>