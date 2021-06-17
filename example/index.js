import '@babel/polyfill';
import Vue from 'vue/dist/vue.esm.js';
import App from './views/app.vue';
import '@example/styleSheets/app.css';


new Vue({
    el: '#app',
    components: {
        App,
    },
    template: '<App />',
});