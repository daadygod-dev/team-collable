import React from "react"
import { Card, CardContent, CardTitle, CardAction, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ChevronsUpDown, CloudDownload, Icon, Plus } from "lucide-react"




const CardData = [
    {
        id: 1,
        title: "Total Projects",
        count: 8,
        status: "increased from last month",
        Icon: <ArrowUpRight size={18} />
    },
    {
        id: 2,
        title: "Ended Projects",
        count: 15,
        status: "increased from last month",
        Icon: <ArrowUpRight size={18} />
    },
    {
        id: 3,
        title: "Running Projects",
        count: 20,
        status: "increased from last month",
        Icon: <ArrowUpRight size={18} />
    },
    {
        id: 4,
        title: "Pending Projects",
        count: 5,
        status: "On discuss",
        Icon: <ArrowUpRight size={18} />
    },

]


export default function DashboardHome() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between p-4  h-20">
                <div>
                    <h3 className="font-semibold text-2xl text-neutral-700">
                        Dashboard
                    </h3>
                    <p className="text-sm text-neutral-500">
                        Plan,Priotize and accomplish your tasks with ease
                    </p>
                </div >

                <div className="flex gap-2 justify-center items-center ">
                    <Button className={"flex gap-1 justify-center items-center bg-linear-to-b from-[#14532d] to-[#064e3b] cursor-pointer capitalize"}>
                        <Plus size={18} className="text-white" />
                        add project

                    </Button>
                    <Button variant="outline" className={"cursor-pointer flex gap-1 justify-center items-center  capitalize"}>
                        <CloudDownload size={18} />
                        Import Data
                    </Button>


                </div>

            </div>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4  p-5 md:p-8 w-full  ">
                {
                    CardData.map((data) => (
                        <Card className={"hover:bg-linear-to-b hover:from-[#14532d] hover:to-[#23805b] p-4 rounded-2xl h-fit border shadow hover:text-white cursor-pointer transition-colors duration-150  "}
                            key={data.id}
                        >
                            <CardHeader className={"flex justify-between p-2 pb-0"}>
                                <h3 className="font-semibold text-lg opacity-80" >
                                    {
                                        data.title
                                    }
                                </h3>

                                <Button className={"rounded-full h-8 w-8 p-2 "} variant="outline">
                                    {
                                        data.Icon
                                    }
                                </Button>



                            </CardHeader>
                            <CardContent>
                                <h3 className="font-bold text-xl">
                                    {
                                        data.count
                                    }
                                </h3>
                                <p className="capitalize text-black/35 text-xs flex gap-0.5 justify-start items-start py-2">
                                    <ChevronsUpDown size={14} />
                                    {data.status}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                }


            </section>

        </div>
    )
}