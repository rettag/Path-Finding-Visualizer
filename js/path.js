let size = 50;
let drag_red = false;
let drag_green = false;
let place_barrier = false;
let remove = false;
let erase = false;
let prev_red_i = 49;
let prev_red_j = 49;
let prev_green_i = 0;
let prev_green_j = 0;

let last_visited = Array(2500);

let run_ = document.getElementById("run");

// Delay Clock
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

function createGrid() {
    let grid = document.querySelector('.grid');
    grid.style.setProperty('--size', size);

    FindGridDim();

    let j = 0;
    let i = 0;
    for (let k = 0; k < size * size; k++) {
        const box = document.createElement('div');
        box.classList.add('box');
        
        if (k % size == 0 && k != 0) {
            j = 0;
            i++;
        }

        box.id = i + " " + j;
        j++;

        //Add Starting WayPoints
        if (box.id == "0 0") {
            box.style.backgroundColor = "lightgreen";
        }
        if (box.id == "49 49") {
            box.style.backgroundColor = "red";
        }
        

        box.addEventListener('mouseover', function() {
            let idxs = box.id.match(/\d+/g);
            let i = parseInt(idxs[0]);
            let j = parseInt(idxs[1]);
            let mapIdx = (50 * i) + j;
            
            if (place_barrier && box.style.backgroundColor != "lightgreen" && box.style.backgroundColor != "red") {
                let barrier = document.getElementById(i + " " + j);
                barrier.style.backgroundColor = "gray";
            }

            if (drag_red == true && box.style.backgroundColor != "lightgreen" && box.style.backgroundColor != "gray") {
                box.style.backgroundColor = "red";
                let red = document.getElementById(prev_red_i + " " + prev_red_j);
                red.style.backgroundColor = "whitesmoke";
                prev_red_i = i;
                prev_red_j = j;
            }

            if (remove == true && box.style.backgroundColor == "gray") {
                let box_to_remove = document.getElementById(i + " " + j);
                box_to_remove.style.backgroundColor = "whitesmoke"
            } 

            if (drag_green == true && box.style.backgroundColor != "red" && box.style.backgroundColor != "gray") {
                box.style.backgroundColor = "lightgreen";
                let green = document.getElementById(prev_green_i + " " + prev_green_j);
                green.style.backgroundColor = "whitesmoke";
                prev_green_i = i;
                prev_green_j = j;
            }

            if (erase && box.style.backgroundColor != "red" && box.style.backgroundColor != "lightgreen") {

            }
        })

        box.addEventListener('mousedown', function() {
            let idxs = box.id.match(/\d+/g);
            let i = parseInt(idxs[0]);
            let j = parseInt(idxs[1]);
            let mapIdx = (50 * i) + j;

            if (box.style.backgroundColor == "red") {
                drag_red = true;
                prev_red_i = i;
                prev_red_j = j;
            }
            else if (box.style.backgroundColor == "lightgreen") {
                drag_green = true;
                prev_green_i = i;
                prev_green_j = j;
            }
            else if (box.style.backgroundColor == "gray") {
                remove = true;
                let box_to_remove = document.getElementById(i + " " + j);
                box_to_remove.style.backgroundColor = "whitesmoke"
            }
            else {
                place_barrier = true;
                let barrier = document.getElementById(i + " " + j);
                barrier.style.backgroundColor = "gray";
            }
        })

        box.addEventListener('mouseup', function() {
            drag_red = false;
            drag_green = false;
            place_barrier = false;
            remove = false;
        })
        
        grid.appendChild(box);
    }
}

function FindGridDim() {
    let screen_height = window.innerHeight;
    let screen_width = window.innerWidth;

    var dimension;
    if (screen_height > screen_width) {
        dimension = screen_width;
    }
    else {
        dimension = screen_height;
    }

    dimension *= 0.01;
    dimension = Math.floor(dimension) - 2;
    dimension *= 100;

    let grid = document.querySelector('.grid');
    grid.style.setProperty('--height', dimension + "px");
    grid.style.setProperty('--width', dimension + "px");
}

class Box {
    constuctor(idx_i, idx_j, discovered, distance, previous_i, previous_j) {
        idx_i = -1;
        idx_j = -1;
        discovered = false;
        distance = 1;
        previous_i = -1;
        previous_j = -1;
    }
}


class Coords {
    constuctor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//Adjacency Graph
map = new Array(2500);

function createAdjacencyGraph() {
    for (let i = 0; i < map.length; i++) {
        map[i] = new Array;
    }

    var grid_width = 49;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            let box = document.getElementById(i + " " + j);

            //Current Idx
            let mapIdx = (50 * i) + j;
            //Idxs for adjacency map
            let mapIdxBottom = (50 * (i + 1)) + j;
            let mapIdxTop = (50 * (i - 1)) + j;
            let mapIdxLeft = (50 * i) + j - 1;
            let mapIdxRight = (50 * i) + j + 1;
            if (box.style.backgroundColor == 'gray') {
                continue;
            }
            else {
                // If its the top left
                if (i == 0 && j == 0) {
                    //Add surrounding boxes to map
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }
                // If its the top right
                else if (i == 0 && j == grid_width) {
                    // Add surrounding boxes to map
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));

                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                }
                //If its the bottom left
                else if (i == grid_width && j == 0) {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }
                // If its the bottom right
                else if (i == grid_width && j == grid_width) {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                }
                // If its the top
                else if (i == 0) {
                    //Add surrounding boxes to map
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }
                // If its the bottom
                else if (i == grid_width) {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }
                //If its the left
                else if (j == 0) {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }
                //If its the right
                else if (j == grid_width) {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                }
                //If its the center
                else {
                    //Add surrounding boxes to map
                    let box_top = document.getElementById((i - 1) + " " + j);
                    let box_bottom = document.getElementById((i + 1) + " " + j);
                    let box_left = document.getElementById(i + " " + (j - 1));
                    let box_right = document.getElementById(i + " " + (j + 1));

                    if (box_top.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxTop, box_top.id]);
                    }
                    if (box_bottom.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxBottom, box_bottom.id]);
                    }
                    if (box_left.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxLeft, box_left.id]);
                    }
                    if (box_right.style.backgroundColor != 'gray') {
                        map[mapIdx].push([mapIdxRight, box_right.id]);
                    }
                }

            }
        }
    }
} //createMap

//Depth First Search
async function DFS() {
    let stack = Array();

    let prev_current = -1;
    let startIdx = (50 * prev_green_i) + prev_green_j;
    let endIdx = (50 * prev_red_i) + prev_red_j
    
    let visited = Array(2500);
    for (let i = 0; i < visited.length; i++) {
        visited[i] = false;
    }

    for (let i = 0; i < last_visited.length; i++) {
        last_visited[i] = [-1, -1, -1];
    }

    stack.push(startIdx);
    visited[startIdx] = true;

    let found = false;
    let currentIdx = startIdx;
    while(stack.length != 0) {
        currentIdx = stack.pop();
        visited[currentIdx] = true;

        if (currentIdx == endIdx) {
            //last_visited[endIdx][0] = prev_current;
            break;
        }

        for (let i = 0; i < map[currentIdx].length; i++) {
            if (visited[map[currentIdx][i][0]] == false) {
                visited[map[currentIdx][i][0]] = true;
                stack.push(map[currentIdx][i][0]);

                boxID = map[currentIdx][i][1];
                let idxs = boxID.match(/\d+/g);
                let x = parseInt(idxs[0]);
                let y = parseInt(idxs[1]);

                last_visited[map[currentIdx][i][0]] = [currentIdx, x, y];

                if (map[currentIdx][i][0] != endIdx) {
                    let box = document.getElementById(boxID);
                    box.style.backgroundColor = "purple";
                }
            }
        }
        await sleep(5);

        prev_current = currentIdx;
    }
    Backtracking();
}

// Breadth First Search
async function BFS() {
    let queue = Array();

    let prev_current = -1;
    let startIdx = (50 * prev_green_i) + prev_green_j;
    let endIdx = (50 * prev_red_i) + prev_red_j
    
    let visited = Array(2500);
    for (let i = 0; i < visited.length; i++) {
        visited[i] = false;
    }

    for (let i = 0; i < last_visited.length; i++) {
        last_visited[i] = [-1, -1, -1];
    }

    queue.push(startIdx);
    let currentIdx = startIdx;

    while(queue.length != 0) {
        currentIdx = queue.shift();
        visited[currentIdx] = true;

        if (currentIdx == endIdx) {
            //last_visited[endIdx][0] = prev_current;
            break;
        }

        for (let i = 0; i < map[currentIdx].length; i++) {
            if (visited[map[currentIdx][i][0]] == false) {
                visited[map[currentIdx][i][0]] = true;
                queue.push(map[currentIdx][i][0]);

                boxID = map[currentIdx][i][1];
                let idxs = boxID.match(/\d+/g);
                let x = parseInt(idxs[0]);
                let y = parseInt(idxs[1]);

                last_visited[map[currentIdx][i][0]] = [currentIdx, x, y];

                if (map[currentIdx][i][0] != endIdx) {
                    let box = document.getElementById(boxID);
                    box.style.backgroundColor = "purple";
                }
            }
        }
        await sleep(3);

        prev_current = currentIdx;
        console.log(queue);
    }
    Backtracking();
}

async function Backtracking() {
    let backtrack = Array();
    
    let startIdx = (50 * prev_green_i) + prev_green_j;
    let endIdx = (50 * prev_red_i) + prev_red_j
    let currentIdx = endIdx;

    while (last_visited[currentIdx][0] != -1 && currentIdx != startIdx) {

        let i = last_visited[currentIdx][1];
        let j = last_visited[currentIdx][2];
        let current_box = document.getElementById(i + " " + j);
        if (currentIdx != startIdx && currentIdx != endIdx) {
            current_box.style.backgroundColor = "yellow";
            await sleep(10);
        }

        backtrack.push(currentIdx);
        currentIdx = last_visited[currentIdx][0];
    }

}

// Main Run
async function run() {
    createAdjacencyGraph();
    BFS();
    await sleep(100);
}

run_.addEventListener("click", function() {
    run();
})