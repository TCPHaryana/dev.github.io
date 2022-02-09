// JavaScript source code
///////////////////////////////////  Security////////////////////////////
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    alert('Right Click is Disabled');
}, false);

document.addEventListener("keydown", function (e) {
    // USE THIS TO DISABLE CONTROL AND ALL FUNCTION KEYS
    // if (e.ctrlKey || (e.keyCode>=112 && e.keyCode<=123)) {
    // THIS WILL ONLY DISABLE CONTROL AND F12
    if (e.ctrlKey || (e.keyCode >= 112 && e.keyCode <= 123)) {
        e.stopPropagation();
        e.preventDefault();
    }
});

