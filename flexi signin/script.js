let featuresbtn = document.querySelector(".featuresBtn");
let featuresMenu = document.querySelector(".featuresMenu");

featuresbtn.addEventListener("mouseover", ()=>{
    featuresMenu.style.display = "block";
});

featuresbtn.addEventListener("mouseleave", () => {
    setTimeout(() => {
      if (!featuresMenu.matches(":hover")) {
        featuresMenu.style.display = "none";
      }
    }, 200);
  });

featuresMenu.addEventListener("mouseleave", () => {
    featuresMenu.style.display = "none";
  });

let btn = document.querySelector(".btn");

btn.addEventListener("click", ()=>{
    window.location.href = "register.html";
});

const help = document.querySelector(".help")

const footer = document.getElementById('page-footer');

help.addEventListener('click', (event) => {
    event.preventDefault();
    footer.scrollIntoView({
      behavior: 'smooth'
    });
  });

