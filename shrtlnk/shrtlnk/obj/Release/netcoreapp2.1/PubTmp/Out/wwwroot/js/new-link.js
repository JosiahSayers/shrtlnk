const li = document.querySelector('#new-link-li');
const copyIcon = document.querySelector('#copy-icon');

copyIcon.addEventListener('click', event => {
    let textArea = document.createElement('textarea');
    textArea.value = li.childNodes[3].innerText;
    document.querySelector('body').appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.querySelector('body').removeChild(textArea);
});

copyIcon.addEventListener('mouseover', event => {
    document.querySelector('box').className = 'tooltip';
});

copyIcon.addEventListener('click', event => {
    document.querySelector('box').innerText = 'COPIED!';
});

copyIcon.addEventListener('mouseleave', event => {
    setTimeout(() => {
        document.querySelector('box').className = 'hidden';
        setTimeout(() => document.querySelector('box').innerText = 'Click to copy URL', 200);
    }, 400);
});