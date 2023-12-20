import $ from 'jquery';

$(document).ready(() => {
    $('#save').on('click', e => {
        e.preventDefault();
        saveTask();
    });
    $('#add-step').on('click', e => {
        e.preventDefault();
        addStep();
    });
    initialize();
});

function makeTaskRow({title, description, id}) {
    return $('<tr></tr>').data('id', id).append([
        $('<td></td>').append(
            $('<a></a>')
                .attr('role', 'button')
                .attr('href', '#')
                .text(title)
                .on('click', e => {
                    e.preventDefault();
                    selectTask(id);
                })
        ),
        $('<td></td>').append(description || ""),
    ]);
}

// gets initial data
function initialize() {
    $('#cancel').on('click', e => {
        e.preventDefault();
        clearTaskForm();
    });
    $.get('/tasks', data => {
        let rows = data.map(makeTaskRow);
        $('#tasks > tbody').empty().append(rows);
    });
}

function addStep(step = {}) {
    const steps_length = $('#new-task tbody').children().length;
    function makeDeleteButton(idx) {
        return $('<button></button>').text('Delete').on('click', e => {
            e.preventDefault();
            $('#new-task tbody').children().eq(idx).remove();
            // if this was the second to last step, remove the button from the last
            if ($('#new-task tbody').children().length === 1) {
                $('#new-task tbody > tr > td:last-child > button').remove();
            }
            // TODO call DELETE /steps/step.id
        });
    }
    // includes delete button in first element as there is more than 1 step
    if (steps_length === 1) {
        $('#new-task tbody > tr > td:last-child').append(
            makeDeleteButton(0)
        );
    }
    // adds step input fields
    $('#new-task tbody').append(
        $('<tr></tr>').data('id', step.id || '').append([
            $('<td></td>').append(
                $('<input></input>').attr('type','text').val(step.title || '')
            ),
            $('<td></td>').append(
                $('<textarea></textarea>').val(step.description || '')
            ),
            $('<td></td>').append(
                $('<input></input>')
                    .attr('type','checkbox')
                    .attr('role','switch')
                    .prop('checked', step.completed || false)
            ),
            $('<td></td>').append(
                steps_length >= 1 ? [makeDeleteButton(steps_length)] : []
            )
        ])
    );
}

function selectTask(id) {
    clearTaskForm();
    $('#task-id').val(id);
    $('#task-action').text('Edit Task');
    $('#delete').removeClass('hidden');
    $('#cancel').removeClass('hidden');
    $.get(`/tasks/${id}`, ({title, description, steps}) => {
        $('#new-task > label > input[type="text"]').val(title);
        $('#new-task > label > textarea').val(description);
        $('#new-task > table > tbody').empty();
        for (const step of steps) {
            addStep(step);
        }
    });
}

function saveTask() {
    let id = $('#task-id').val();
    if (id === "") {
        id = null;
    } else {
        id = parseInt(id);
    }

    const title = $('#new-task > label > input[type="text"]').val();
    let description = $('#new-task > label > textarea').val();
    if (description === "") {
        description = null;
    }

    let steps = [];
    $('#new-task > table > tbody').children().each((_idx, elem) => {
        const tr = $(elem);
        const title = tr.children().eq(0).children().eq(0).val();
        let description = tr.children().eq(1).children().eq(0).val();
        if (description === "") {
            description = null;
        }
        const completed = tr.children().eq(2).children().eq(0).is(':checked');
        steps.push({title, description, completed});
    });
    const task = {title, description, steps};

    if (id) {
        $.ajax({
            url: `/tasks/${id}`,
            type: 'UPDATE',
            data: JSON.stringify(task),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: () => {
                let newRow = makeTaskRow({title, description, id});
                $(`#tasks > tbody > tr[data-id=${id}]`).replaceWith(newRow);
                clearTaskForm();
            }
        });
    } else {
        $.ajax({
            url: '/tasks',
            type: 'POST',
            data: JSON.stringify(task),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: id => {
                let newRow = makeTaskRow({title, description, id});
                $('#tasks > tbody').append(newRow);
                clearTaskForm();
            }
        });
    }
}

function clearTaskForm() {
    $('#task-action').text('New Task');
    $('#delete').addClass('hidden');
    $('#cancel').addClass('hidden');
    $('#task-id').removeAttr('value');
    $('#new-task > label > input[type="text"]').val('');
    $('#new-task > label > textarea').val('');
    $('#new-task > table > tbody').empty();
    addStep();
}
