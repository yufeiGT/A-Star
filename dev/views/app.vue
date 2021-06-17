<template>
    <div id="app" ref="app">
    </div>
</template>
<script>
import AStar from 'astar';

export default {
    mounted() {
        const astar = new AStar({
            row: 30,
            col: 30,
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 20,
                y: 29,
            },
            grayarea: [{
                x: 1,
                y: 0,
            }, {
                x: 9,
                y: 5,
            }, {
                x: 10,
                y: 4,
            }, {
                x: 11,
                y: 5,
            }],
            autoCompute: true,
            container: document.querySelector('#app'),
            renderFindArea: true,
        });
        console.log(astar.path);
        astar.setOptions({
            end: {
                x: 0,
                y: 2,
            },
        });
        console.log(astar.path);
    },
};
</script>
<style lang="scss">
#app {
    color: #2c3e50;
    height: 100%;

    .item {
        width: 50%;
        height: 100%;
        float: left;
    }
}
</style>