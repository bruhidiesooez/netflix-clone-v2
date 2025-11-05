import axios from "axios";

const fetcher = (url: string): Promise<any> => axios.get(url).then((res) => res.data) as Promise<any>;

export default fetcher;
