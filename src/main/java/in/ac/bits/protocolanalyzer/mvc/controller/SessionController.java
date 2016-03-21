/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package in.ac.bits.protocolanalyzer.mvc.controller;

import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import in.ac.bits.protocolanalyzer.analyzer.PacketWrapper;
import in.ac.bits.protocolanalyzer.analyzer.Session;
import in.ac.bits.protocolanalyzer.protocol.Protocol;
import in.ac.bits.protocolanalyzer.protocol.ProtocolGraphParser;
import in.ac.bits.protocolanalyzer.utils.ApplicationContextUtils;

/**
 *
 * @author crygnus
 */
@Controller
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private Session session;

    @Autowired
    private ProtocolGraphParser graphParser;

    @Autowired
    ApplicationContextUtils contextUtils;

    @Autowired
    Protocol protocol;

    List<PacketWrapper> packets;

    @RequestMapping(value = "/analysis", method = RequestMethod.GET)
    public @ResponseBody String analyze(
            @RequestParam("graph") String protocolGraphStr) {
        System.out.println("Got the graph String. Here it is - ");
        System.out.println(protocolGraphStr);
        init();
        graphParser.configureSession(session, protocolGraphStr);
        System.out.println("Successfully completed session configuration!!");
        /* long readCount = 0; */
        long readCount = session.startExperiment();
        JSONObject response = new JSONObject();
        response.put("status", "success");
        response.put("pktCount", readCount);
        return response.toString();
    }

    /*
     * later this method can be converted to an API.
     */
    private void init() {
        ApplicationContext context = new ClassPathXmlApplicationContext(
                "classpath:spring/appconfig.xml");
        contextUtils.setApplicationContext(context);
        session.init("session_name");
        System.out.println("Session init complete!!");
        protocol.init();
        System.out.println(
                "Successfully completed init method in session controller!!");
    }
}
