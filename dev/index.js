import '@babel/polyfill';
import Vue from 'vue/dist/vue.esm.js';
import App from './views/app.vue';


new Vue({
    el: '#app',
    components: {
        App,
    },
    template: '<App />',
});