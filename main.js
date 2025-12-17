function manual_set(res) {
    let container = $(".results_container");

    let paddingTop = parseFloat(container.css("paddingTop"));
    let paddingBottom = parseFloat(container.css("paddingBottom"));

    // freeze current size
    container.css({
        height: container.outerHeight()-paddingTop-paddingBottom,
        overflow: "hidden"
    });

    // collapse
    container.animate(
        { height: 0, paddingTop: 0, paddingBottom: 0 },
        400,
        "swing",
        function () {
            // rebuild
            container.empty();
            container.append("<h4>results</h4>");

            let results = $("<div class='results'></div>");
            for (let obj of res) {
                let result_ele = $(`
                    <div class="result">
                        <div class="result_name result_part"></div>
                        <div class="result_divider"></div>
                        <div class="result_count result_part"></div>
                    </div>
                `);
                result_ele.find(".result_name").html(obj.name);
                result_ele.find(".result_count").html(obj.count);
                results.append(result_ele);
            }
            container.append(results);

            // measure expanded height
            container.css({
                height: "auto",
                paddingTop,
                paddingBottom
            });

            let targetHeight = container.outerHeight();

            // snap closed again
            container.css({
                height: 0,
                paddingTop: 0,
                paddingBottom: 0
            });

            // expand
            container.animate(
                {
                    height: targetHeight-paddingTop-paddingBottom, // targetHeight includes our padding, which we actually dont want
                    paddingTop, // as these will
                    paddingBottom // already handle it
                },
                400,
                "swing",
                function () {
                    container.css({
                        height: "",
                        overflow: ""
                    });
                }
            );
        }
    );
}

function expand_container(container) {
    let paddingTop = parseFloat(container.css("paddingTop")) || 15;
    let paddingBottom = parseFloat(container.css("paddingBottom")) || 15;

    container.css({
        visibility: "visible",
        height: "auto",
        paddingTop,
        paddingBottom
    });

    let targetHeight = container.outerHeight() - paddingTop - paddingBottom;

    container.css({
        height: 0,
        paddingTop: 0,
        paddingBottom: 0
    });

    container.animate(
        {
            height: targetHeight,
            paddingTop,
            paddingBottom
        },
        300,
        "swing",
        function () {
            container.css({
                height: "",
                overflow: ""
            });
        }
    );
}


function automatic_set(res) {
    let container = $(".results_container");

    container.empty();
    container.append("<h4>results</h4>");

    let results = $("<div class='results'></div>");
    for (let obj of res) {
        let result_ele = $(`
            <div class="result">
                <div class="result_name result_part"></div>
                <div class="result_divider"></div>
                <div class="result_count result_part"></div>
            </div>
        `);
        result_ele.find(".result_name").html(obj.name);
        result_ele.find(".result_count").html(obj.count);
        results.append(result_ele);
    }
    container.append(results);
}

async function talk_to_r34(query) {
    var res = await fetch("https://api.rule34.xxx/autocomplete.php?q="+query);
    var json = await res.json();
    console.log(json);
    var out = [];
    for (let thing of json) {
        out.push({name:thing.value,count:thing.label.slice(thing.value.length+2, -1)});
    }
    return out;
}

$("#searchbar").on("input",async e=>{
    if (document.getElementById('autosearch').checked) {
        let container = $(".results_container");
        automatic_set(await talk_to_r34($("#searchbar").val()));
        if (container.css("visibility") == "hidden") {
            expand_container(container);
        }
    }
});

$("#searchbar").on("keydown",async e=>{
    if (!document.getElementById('autosearch').checked) {
        if (e.key == "Enter") {
            let data = await talk_to_r34($("#searchbar").val());
            let container = $(".results_container");
            if (container.css("visibility") == "hidden") {
                automatic_set(data);
                expand_container(container);
            } else {
                manual_set(data);
            }
        }
    }
});