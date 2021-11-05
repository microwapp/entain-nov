<template>
  <div id="app">
    <div class="racing_container">
      <div class="racing_title">
        <h1>Next to go</h1>
      </div>
      <div class="racing_category">
        <div class="greyhoundToggle">
          Greyhound racing:
          <label for="greyhound" class="switch">
            <input
              id="greyhound"
              name="greyhound"
              type="checkbox"
              :checked="checkBox[0]"
              @click="switchMatch($event, '1')"
            />
            <span class="slider round"></span>
          </label>
        </div>

        <div class="harnessToggle">
          Harness racing:
          <label for="harness" class="switch">
            <input
              id="harness"
              name="harness"
              type="checkbox"
              :checked="checkBox[1]"
              @click="switchMatch($event, '2')"
            />
            <span class="slider round"></span>
          </label>
        </div>
        <div class="horseracingToggle">
          Horse racing:
          <label for="horse" class="switch">
            <input
              id="horse"
              name="horse"
              type="checkbox"
              :checked="checkBox[2]"
              @click="switchMatch($event, '3')"
            />
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      <div class="racing_infor">
        <table>
          <tr>
            <td>race_number</td>
            <td>meeting_name</td>
            <td>countingdown timer</td>
          </tr>
          <tr v-for="(item, index) in current" :key="index">
            <td>{{ item.race_number }}</td>
            <td>{{ item.meeting_name }}</td>
            <td>{{ item.countingdown_timer }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { get } from "./request";
export default {
  name: "App",

  created() {
    this.init("0");
  },

  setup() {
    const dataGreyhound = ref([]);
    const Harness = ref([]);
    const Horse = ref([]);
    const nextToGo = ref([]);
    const current = ref([]);
    var timer = null;
    const checkBox = ref([false, false, false]);

    //Sort array function one
    function sortArray(arr, key, secondKey) {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
          if (arr[j][key][secondKey] > arr[j + 1][key][secondKey]) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
    }
    //Sort array function two
    function sortArray2(arr, key, secondKey) {
      arr.sort(
        (first, second) => first[key][secondKey] - second[key][secondKey]
      );
    }

    function countdown(arr, key, secondKey, currenPage) {
      clearInterval(timer);
      for (let i = 0; i < arr.length; i++) {
        // console.log(arr[i][key][secondKey]);
        var EndTime = arr[i][key][secondKey];
        var NowTime = new Date();
        var t = EndTime - (NowTime.getTime() / 1000).toFixed(0);
        arr[i]["countingdown_timer"] = GetRTime(t);
        // console.log(arr[i]["countingdown_timer"]);
        if (t > 0) {
          timer = setInterval(() => {
            for (let j = 0; j < arr.length; j++) {
              var EndTime = arr[i][key][secondKey] + 1000;
              var NowTime = new Date();
              var t = EndTime - (NowTime.getTime() / 1000).toFixed(0);
              arr[i]["countingdown_timer"] = GetRTime(t);
            }
          }, 1000);
        } else {
          init(currenPage);
        }
      }
      // console.log(arr);
    }

    function GetRTime(t) {
      var d = Math.floor(t / 60 / 60 / 24);
      var h = Math.floor((t / 60 / 60) % 24);
      var m = Math.floor((t / 60) % 60);
      var s = Math.floor(t % 60);
      if (parseInt(d) < 10) {
        d = "0" + d;
      }
      if (parseInt(h) < 10) {
        h = "0" + h;
      }
      if (parseInt(m) < 10) {
        m = "0" + m;
      }
      if (parseInt(s) < 10) {
        s = "0" + s;
      }

      if (d == "00" && h == "00" && m == "00") {
        return `${s}Seconds`;
      } else if (d == "00" && h == "00") {
        return `${m}Minutes ${s}Seconds`;
      } else if (d == "00") {
        return `${h}Hours ${m}Minutes ${s}Seconds`;
      } else {
        return `${d}Days ${h}Hours ${m}Minutes ${s}Seconds`;
      }
    }

    function init(currentPage) {
      get(
        "https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10"
      ).then((res) => {
        // console.log(res);
        let nextRaces = res.data.next_to_go_ids;
        nextToGo.value = [];
        dataGreyhound.value = [];
        Harness.value = [];
        Horse.value = [];
        for (let race in res.data.race_summaries) {
          let category = res.data.race_summaries[race].category_id;
          let single_race = res.data.race_summaries[race];
          let raceId = res.data.race_summaries[race].race_id;
          for (let i = 0; i < nextRaces.length; i++) {
            if (nextRaces[i] == raceId) {
              nextToGo.value.push(single_race);
            }
          }
          if (category == "9daef0d7-bf3c-4f50-921d-8e818c60fe61") {
            dataGreyhound.value.push(single_race);
          } else if (category == "9daef0d7-bf3c-4f50-921d-8e818c60fe61") {
            Harness.value.push(single_race);
          } else {
            Horse.value.push(single_race);
          }
        }

        sortArray2(nextToGo.value, "advertised_start", "seconds");
        sortArray2(dataGreyhound.value, "advertised_start", "seconds");
        sortArray2(Harness.value, "advertised_start", "seconds");
        sortArray2(Horse.value, "advertised_start", "seconds");

        if (currentPage == "0" && nextToGo.value.length > 0) {
          countdown(nextToGo.value, "advertised_start", "seconds", currentPage);
          current.value = [];
          for (let i = 0; i < 5; i++) {
            current.value.push(nextToGo.value[i]);
          }
        } else if (currentPage == "1" && dataGreyhound.value.length > 0) {
          countdown(
            dataGreyhound.value,
            "advertised_start",
            "seconds",
            currentPage
          );
          current.value = [];
          for (let i = 0; i < 5; i++) {
            current.value.push(dataGreyhound.value[i]);
          }
        } else if (currentPage == "2" && Harness.value.length > 0) {
          countdown(Harness.value, "advertised_start", "seconds", currentPage);
          current.value = [];
          for (let i = 0; i < 5; i++) {
            current.value.push(Harness.value[i]);
          }
        } else if (currentPage == "3" && Horse.value.length > 0) {
          countdown(Horse.value, "advertised_start", "seconds", currentPage);
          current.value = [];
          for (let i = 0; i < 5; i++) {
            current.value.push(Horse.value[i]);
          }
        } else {
          return { error: "error" };
        }
      });
    }

    function switchMatch(e, type) {
      if (e.target.checked == true) {
        init(type);
        for (let i = 0; i < 3; i++) {
          checkBox.value[i] = false;
        }
        checkBox.value[parseInt(type) - 1] = true;
      } else {
        init("0");
      }
    }

    return {
      dataGreyhound,
      Harness,
      Horse,
      nextToGo,
      current,
      sortArray,
      sortArray2,
      countdown,
      GetRTime,
      switchMatch,
      init,
      timer,
      checkBox,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
table {
  width: 100%;
  border-collapse: collapse;
}

table,
td,
th {
  border: 1px solid black;
}
.racing_container {
  width: 600px;
  margin: 0 auto;
}
.racing_category div {
  font-size: 22px;
  font-weight: 700;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
input:checked + .slider {
  background-color: #2196f3;
}
input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}
input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
