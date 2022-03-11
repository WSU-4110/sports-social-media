$('#filterC').change(function () {
    var value = $('#filterC :selected').text();
    $('.teamCard').hide();
    $('[data-conference="' + value + '"]').show();
});

$('#filterD').change(function () {
    var value1 = $('#filterD :selected').text();
    $('.teamDiv').hide();
    $('[data-division="' + value1 + '"]').show();
});