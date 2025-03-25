import React from "react";
import { useSelector } from "react-redux";
import monsterImage from "../../../public/Neclord/Neclord_(S2_PS1_enemy).png";

import ProgressBar from "../ProgressBar/ProgressBar";
import "./Monster.css";

function Monster() {
  const monster = useSelector((state) => state.fight.monster);

  return (
    <section>
      <div className="container">
        <div className="row">
          <div className="card-monstre col-sm-12">
            <div id="monsterCard">
              <div className="text-center">
                <div className="row">
                  <div className="col-sm-2 offset-sm-3">
                    <span
                      className="badge badge-danger ml-2 "
                      id="degatSpanMonster"
                    ></span>
                    <img
                      className="img-fluid"
                      src={monsterImage}
                      alt="monster"
                    />
                  </div>

                  <div id="comboOnMonster" className="col-sm-6"></div>
                </div>
              </div>
              <ProgressBar
                pv={monster.pv}
                pvMax={monster.pvMax}
                bgType="bg-danger"
                faType="fa-heart"
                barName=" : pv"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Monster;
