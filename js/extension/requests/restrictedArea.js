import axios from "@mapstore/libs/ajax";

export const getAreaOfCompetence = (url = "/console/account/areaofcompetence") =>
    axios.get(url).then((response) => response?.data);
