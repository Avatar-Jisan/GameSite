$("#menuBtn").click(function () {
  $(this).toggleClass("active");
  $(".sidebar").toggleClass("active");
  $(".sidebar-overlay").toggleClass("active");
});