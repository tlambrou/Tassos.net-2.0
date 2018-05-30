function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

$(document).ready(function() {

  const scrollReveal = () => {// Select all links with hashes
    $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
              $target.focus(); // Set focus again
            };
          });
        }
      }
    });

    window.sr = ScrollReveal();
    // sr.reveal('.card');
    sr.reveal('.profile-summary');
    // sr.reveal('.grid');
    sr.reveal('.reveal');
  }

  scrollReveal();

  // TYPED.JS
  // var typed = new Typed('.typed', {
  //   stringsElement: '#typed-strings'
  // });
})

window.onload = () => {

  $('#lineDrawing').show()

  var lineDrawing = anime({
    targets: '#lineDrawing .lines path',
    strokeDashoffset: [anime.setDashoffset, 0],
    // easing: [.91,-0.54,.29,1.56],
    easing: 'easeInQuad',
    duration: 3200,
    delay: function(el, i) { return (getRandomInt(1, 12) * 300) },
    direction: 'alternate',
    loop: true,
  });

  var colors = anime({
    targets: '#lineDrawing .lines path',
    stroke: [
      {value: '#08F0FF'},
      {value: '#00FF87'},
      {value: '#EBFF00'},
      {value: '#FF0072'},
      {value: '#8409FF'},
      {value: '#08F0FF'},
      {value: '#00FF87'},
      {value: '#B4FFEA'},
    ],
    delay: function(el, i) { return (getRandomInt(1, 12) * 300) },
    easing: 'easeInBack',
    direction: 'alternate',
    duration: 3000,
    loop: false,
  });

  var promise = lineDrawing.finished.then(animateSubtitle);

  // var basicTimeline = anime.timeline();
  //
  // basicTimeline
  //   .add({
  //     targets: '#lineDrawing .lines path',
  //     stroke: [
  //       {value: '#08F0FF'},
  //       {value: '#00FF87'},
  //       {value: '#EBFF00'},
  //       {value: '#E90052'},
  //       {value: '#8360C8'},
  //       {value: '#08F0FF'},
  //     ],
  //     delay: function(el, i) { return (getRandomInt(1, 12) * 240) },
  //     easing: 'easeInBack',
  //     direction: 'reverse',
  //     duration: 6000,
  //     loop: true,
  //   })
  //   .add({
  //     targets: '#lineDrawing .lines path',
  //     stroke: [
  //       {value: '#B4FFEA'},
  //       {value: '#B4FFEA'},
  //       {value: '#B4FFEA'},
  //       // {value: 'rgba(138, 196, 180, 0.6)'},
  //       {value: '#08F0FF'},
  //       {value: '#B4FFEA'},
  //       {value: '#B4FFEA'},
  //       {value: '#B4FFEA'},
  //     ],
  //     easing: 'linear',
  //     direction: 'alternate',
  //     duration: 6000,
  //   });


  //
  // var pulse = anime({
  //   targets: '#lineDrawing .lines path',
  //   stroke: [
  //     {value: '#B4FFEA'},
  //     {value: '#B4FFEA'},
  //     {value: '#B4FFEA'},
  //     {value: 'rgba(138, 196, 180, 0.6)'},
  //     {value: '#B4FFEA'},
  //     {value: '#B4FFEA'},
  //     {value: '#B4FFEA'},
  //   ],
  //   easing: 'linear',
  //   direction: 'reverse',
  //   duration: 6000,
  //   delay: 6001,
  //   loop: true,
  // });


  $.fn.extend({
    animateCss: function(animationName, callback) {
      var animationEnd = (function(el) {
        var animations = {
          animation: 'animationend',
          OAnimation: 'oAnimationEnd',
          MozAnimation: 'mozAnimationEnd',
          WebkitAnimation: 'webkitAnimationEnd',
        };

        for (var t in animations) {
          if (el.style[t] !== undefined) {
            return animations[t];
          }
        }
      })(document.createElement('div'));

      this.addClass('animated ' + animationName).one(animationEnd, function() {
        $(this).removeClass('animated ' + animationName);

        if (typeof callback === 'function') callback();
      });

      return this;
    },
  });


  // $('#title').animateCss('fadeInDown');

  function animateSubtitle() {
    $('#subtitle').show()
    $('#subtitle').css('display', 'inline-block');
    $('#subtitle').css('color', 'hsla(360, 100%, 100%, 0.84)');
    $('#subtitle').animateCss('flipInX');
    // $('#title').animateCss('fadeInDown');
    // $('#subtitle').text('Full Stack Web Developer');
  }
}
