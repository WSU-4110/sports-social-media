$('#filterC').change(function () { // Conference filter function
    // created variable to get the selected text from drop down menu
    var value = $('#filterC :selected').text(); 
    $('.teamCard').hide(); // hide everything that doesn't have a data value equal to the selected option
    $('[data-conference="' + value + '"]').show(); // show teams that have selected data value
});

$('#filterD').change(function () { // DIvision filter function
    var value1 = $('#filterD :selected').text(); // grab the selected option
    $('.teamCard').hide(); // hide everything else
    $('[data-division="' + value1 + '"]').show(); // show the teams with data value equal to the selected option
});